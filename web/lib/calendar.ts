import type { Reminder } from './records.ts';
import { validDate } from './validation.ts';

const encoder = new TextEncoder();
const DAY_MS = 24 * 60 * 60 * 1000;

function dateNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}
function checkReminder(reminder: Reminder): void {
  if (!reminder || typeof reminder !== 'object'
    || typeof reminder.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(reminder.id)) throw new Error('invalid_reminder');
  if (!validDate(reminder.date)) throw new Error('invalid_date');
  if (typeof reminder.title !== 'string' || !reminder.title.trim() || reminder.title.length > 100
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(reminder.title)) throw new Error('invalid_title');
  for (const character of reminder.title) {
    const point = character.codePointAt(0)!;
    if (point >= 0xd800 && point <= 0xdfff) throw new Error('invalid_title');
  }
  if (!['personal', 'official', 'other'].includes(reminder.kind)
    || typeof reminder.source !== 'string' || reminder.source.length > 2048
    || !Number.isInteger(reminder.leadDays) || reminder.leadDays < 0 || reminder.leadDays > 365
    || typeof reminder.done !== 'boolean') throw new Error('invalid_reminder');
}
function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function fold(line: string): string {
  const parts: string[] = [];
  let part = '';
  let octets = 0;
  for (const character of line) {
    const length = encoder.encode(character).byteLength;
    if (octets + length > 75) {
      parts.push(part);
      part = ' ';
      octets = 1;
    }
    part += character;
    octets += length;
  }
  parts.push(part);
  return parts.join('\r\n');
}
function httpsSource(source: string): string | null {
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function reminderState(reminder: Reminder, todayYYYYMMDD: string): 'done' | 'overdue' | 'soon' | 'upcoming' {
  checkReminder(reminder);
  if (!validDate(todayYYYYMMDD)) throw new Error('invalid_date');
  if (reminder.done) return 'done';
  const days = (dateNumber(reminder.date) - dateNumber(todayYYYYMMDD)) / DAY_MS;
  if (days < 0) return 'overdue';
  return days <= reminder.leadDays ? 'soon' : 'upcoming';
}

export function toCalendar(reminders: Reminder[], options?: { alarm: boolean }): string {
  if (!Array.isArray(reminders)) throw new Error('invalid_reminder');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SettleK//Preparation reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const ids = new Set<string>();
  for (const reminder of reminders) {
    checkReminder(reminder);
    if (ids.has(reminder.id)) throw new Error('invalid_reminder');
    ids.add(reminder.id);
    const start = reminder.date.replaceAll('-', '');
    const end = new Date(dateNumber(reminder.date) + DAY_MS).toISOString().slice(0, 10).replaceAll('-', '');
    const source = httpsSource(reminder.source);
    const description = 'User-confirmed preparation date; not an app-calculated legal deadline.'
      + `\nKind: ${reminder.kind}` + (source ? `\nSource: ${source}` : '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${reminder.id}@settlek.invalid`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeText(reminder.title)}`,
      `DESCRIPTION:${escapeText(description)}`,
      'STATUS:CONFIRMED',
    );
    if (source) lines.push(`URL:${source}`);
    if (options?.alarm === true) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:-P${reminder.leadDays}D`, `DESCRIPTION:${escapeText(reminder.title)}`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
