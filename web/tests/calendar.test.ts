import test from 'node:test';
import assert from 'node:assert/strict';
import { reminderState, toCalendar } from '../lib/calendar.ts';
import type { Reminder } from '../lib/records.ts';

function reminder(overrides: Partial<Reminder> = {}): Reminder {
  return { id: 'reminder-1', title: '준비 서류 다시 확인하기', date: '2026-12-01', kind: 'personal', source: '', leadDays: 3, done: false, ...overrides };
}
const unfold = (text: string) => text.replace(/\r\n[ \t]/g, '');

test('all-day dates use exclusive following-day ends across month, year and leap boundaries', () => {
  const cases = [
    ['2024-02-28', '20240229'], ['2024-02-29', '20240301'],
    ['2025-02-28', '20250301'], ['2026-04-30', '20260501'], ['2026-12-31', '20270101'],
  ];
  for (const [date, next] of cases) {
    const calendar = unfold(toCalendar([reminder({ date })]));
    assert.ok(calendar.includes(`DTSTART;VALUE=DATE:${date.replaceAll('-', '')}\r\n`));
    assert.ok(calendar.includes(`DTEND;VALUE=DATE:${next}\r\n`));
    assert.ok(!calendar.includes('DTSTART;TZID='));
  }
});

test('date-only exports and reminder states are independent of host time zone and daylight saving', () => {
  const original = process.env.TZ;
  try {
    const results: string[] = [];
    for (const zone of ['UTC', 'Asia/Seoul', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      process.env.TZ = zone;
      const due = reminder({ date: '2026-03-09', leadDays: 1 });
      const text = unfold(toCalendar([due]));
      results.push(text.split('\r\n').filter((line) => line.startsWith('DTSTART') || line.startsWith('DTEND')).join('\n'));
      assert.equal(reminderState(due, '2026-03-08'), 'soon');
      assert.equal(reminderState(due, '2026-03-07'), 'upcoming');
    }
    assert.equal(new Set(results).size, 1);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test('titles escape text delimiters and newlines without injecting extra calendar components', () => {
  const title = '한글, 준비; C:\\서류\r\nEND:VEVENT\nBEGIN:VTODO';
  const calendar = unfold(toCalendar([reminder({ title })]));
  const lines = calendar.split('\r\n');
  assert.ok(lines.includes('SUMMARY:한글\\, 준비\\; C:\\\\서류\\nEND:VEVENT\\nBEGIN:VTODO'));
  assert.equal(lines.filter((line) => line === 'BEGIN:VEVENT').length, 1);
  assert.equal(lines.filter((line) => line === 'END:VEVENT').length, 1);
  assert.equal(lines.filter((line) => line === 'BEGIN:VTODO').length, 0);
  assert.ok(calendar.includes('DESCRIPTION:User-confirmed preparation date\\; not an app-calculated legal deadline.\\nKind: personal'));
});

test('physical lines stay within 75 UTF-8 octets and unfold without losing Korean or emoji', () => {
  const title = '한국생활🙂'.repeat(12);
  const output = toCalendar([reminder({ title })]);
  const physical = output.split('\r\n');
  assert.ok(physical.some((line) => line.startsWith(' ')), 'long UTF-8 text creates a continuation');
  for (const line of physical) assert.ok(new TextEncoder().encode(line).byteLength <= 75, `oversized line: ${line}`);
  assert.ok(unfold(output).split('\r\n').includes(`SUMMARY:${title}`));
  assert.ok(!output.includes('\ufffd'));
  assert.ok(!/(?<!\r)\n/.test(output), 'calendar output uses CRLF, not bare LF');
  assert.ok(output.endsWith('\r\n'));
});

test('UIDs remain stable when reminder details change and DTSTAMP is a UTC timestamp', () => {
  const first = unfold(toCalendar([reminder()]));
  const changed = unfold(toCalendar([reminder({ date: '2027-01-03', title: '변경된 준비 일정' })]));
  const uid = (value: string) => value.split('\r\n').find((line) => line.startsWith('UID:'));
  assert.equal(uid(first), 'UID:reminder-1@settlek.invalid');
  assert.equal(uid(first), uid(changed));
  const stamp = first.match(/DTSTAMP:(\d{8}T\d{6}Z)\r\n/)?.[1];
  assert.ok(stamp);
  const actual = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  assert.equal(stamp.slice(0, 9), actual.slice(0, 9));
});

test('alarms are opt-in and use the selected day offset without inventing a local clock time', () => {
  assert.ok(!toCalendar([reminder()]).includes('BEGIN:VALARM'));
  assert.ok(!toCalendar([reminder()], { alarm: false }).includes('BEGIN:VALARM'));
  const calendar = unfold(toCalendar([reminder({ leadDays: 7 })], { alarm: true }));
  assert.ok(calendar.includes('BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-P7D\r\n'));
  assert.ok(calendar.includes('END:VALARM'));
  assert.ok(!calendar.includes('TZID'));
  assert.ok(!calendar.includes('T090000'));
  assert.ok(toCalendar([reminder({ leadDays: 0 })], { alarm: true }).includes('TRIGGER:-P0D'));
});

test('only HTTPS source links appear in exported data', () => {
  const valid = unfold(toCalendar([reminder({ kind: 'official', source: 'https://www.gov.kr/portal?a=1;b=2' })]));
  assert.ok(valid.includes('URL:https://www.gov.kr/portal?a=1;b=2\r\n'));
  assert.ok(valid.includes('Source: https://www.gov.kr/portal?a=1\\;b=2'));
  for (const source of ['http://example.com/private', 'javascript:alert(1)', 'file:///private/example', 'private source note', 'https://person:secret@example.com/']) {
    const calendar = unfold(toCalendar([reminder({ source })]));
    assert.ok(!calendar.includes('\r\nURL:'));
    assert.ok(!calendar.includes('Source:'));
    assert.ok(!calendar.includes(source));
  }
});

test('all supplied reminders are exported, including completed ones, with valid event status', () => {
  const calendar = unfold(toCalendar([reminder(), reminder({ id: 'reminder-2', done: true })]));
  assert.equal(calendar.split('\r\n').filter((line) => line === 'BEGIN:VEVENT').length, 2);
  assert.equal(calendar.split('\r\n').filter((line) => line === 'STATUS:CONFIRMED').length, 2);
  assert.ok(!calendar.includes('STATUS:COMPLETED'));
  assert.ok(toCalendar([]).includes('END:VCALENDAR'));
});

test('reminder state uses inclusive lead-day boundaries and completed state takes precedence', () => {
  assert.equal(reminderState(reminder({ date: '2026-12-01' }), '2026-12-02'), 'overdue');
  assert.equal(reminderState(reminder({ date: '2026-12-01' }), '2026-12-01'), 'soon');
  assert.equal(reminderState(reminder({ date: '2026-12-01' }), '2026-11-28'), 'soon');
  assert.equal(reminderState(reminder({ date: '2026-12-01' }), '2026-11-27'), 'upcoming');
  assert.equal(reminderState(reminder({ date: '2026-12-01', leadDays: 0 }), '2026-11-30'), 'upcoming');
  assert.equal(reminderState(reminder({ date: '2026-12-01', done: true }), '2026-12-02'), 'done');
});

test('invalid dates, titles, IDs and alarm offsets cannot become calendar content', () => {
  for (const patch of [
    { date: '2025-02-29' }, { date: '2026-12-01T00:00:00Z' }, { title: '' }, { title: '   ' },
    { title: 'x'.repeat(101) }, { title: '\u0000invalid' }, { title: '\ud800' },
    { id: 'injected\r\nBEGIN:VEVENT' }, { leadDays: -1 }, { leadDays: 1.5 },
  ]) assert.throws(() => toCalendar([reminder(patch)]), /invalid_/);
  assert.throws(() => toCalendar([reminder(), reminder()]), /invalid_reminder/);
  assert.throws(() => reminderState(reminder(), '2026-02-30'), /invalid_date/);
});
