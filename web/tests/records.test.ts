import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { blankProfile, buildPlan, reconcilePreparation } from '../lib/planner.ts';
import { sanitizeRecord, readRecord, saveRecord, deleteRecord, handleRecordsRequest, RecordError } from '../lib/records.ts';
import type { SavedRecord, Reminder, HistoryEntry, RecordsDB } from '../lib/records.ts';

function database(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE records (user_id TEXT PRIMARY KEY, payload TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL)');
  t.after(() => sqlite.close());
  const db: RecordsDB = {
    prepare(sql) {
      let values: (string | number | null)[] = [];
      const statement = {
        bind(...bindings: (string | number | null)[]) { values = bindings; return statement; },
        async first<T>() { return (sqlite.prepare(sql).get(...values) ?? null) as T | null; },
      };
      return statement;
    },
  };
  return { db, sqlite };
}
function record(overrides: Partial<SavedRecord> = {}): SavedRecord {
  const profile = {
    ...blankProfile(), status: 'worker', visa: 'E', goal: 'stay', city: '서울',
    expiry: '2027-03-01', answers: { housing: 'lease' },
  };
  return { profile, prep: reconcilePreparation({}, buildPlan(profile)), done: [], reminders: [], language: 'ko', ...overrides };
}
function reminder(overrides: Partial<Reminder> = {}): Reminder {
  return { id: 'reminder-1', title: '공식 안내 다시 확인하기', date: '2026-12-01', kind: 'personal', source: '', leadDays: 3, done: false, ...overrides };
}
function event(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return { id: 'history-1', kind: 'document', itemId: 'lease', action: 'ready', at: '2026-10-26T08:00:00.000Z', context: 'old123', ...overrides };
}
function request(method: string, body?: unknown, options: { user?: string | null; origin?: string | null; url?: string; raw?: string; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers };
  if (options.user !== null) headers['oai-authenticated-user-id'] = options.user ?? 'alice';
  if (method !== 'GET' && options.origin !== null) headers.Origin = options.origin ?? 'https://settlek.test';
  return new Request(options.url ?? 'https://settlek.test/api/records', {
    method, headers, ...(method === 'GET' ? {} : { body: options.raw ?? JSON.stringify(body) }),
  });
}
function conflict(version: number) {
  return (error: unknown) => error instanceof RecordError && error.status === 409 && error.currentVersion === version;
}

test('account records round-trip through real SQLite with independent users and version increments', async (t) => {
  const { db } = database(t);
  assert.equal(await readRecord(db, 'alice'), null);
  const original = record({ reminders: [reminder()], language: 'en' });
  const saved = await saveRecord(db, 'alice', original, 0);
  assert.equal(saved.version, 1);
  assert.ok(Number.isFinite(Date.parse(saved.updatedAt)));
  assert.deepEqual(saved.state, sanitizeRecord(original));
  assert.deepEqual(await readRecord(db, 'alice'), saved);
  assert.equal(await readRecord(db, 'bob'), null);
  const bob = await saveRecord(db, 'bob', record({ language: 'ko' }), 0);
  const updated = await saveRecord(db, 'alice', { ...saved.state, done: ['extension'] }, 1);
  assert.equal(updated.version, 2);
  assert.deepEqual(updated.state.done, ['extension']);
  assert.deepEqual(await readRecord(db, 'bob'), bob);
});

test('atomic create/update/delete reject stale versions and reveal only the owner’s current version', async (t) => {
  const { db } = database(t);
  await saveRecord(db, 'alice', record(), 0);
  const second = await saveRecord(db, 'alice', record({ language: 'en' }), 1);
  await assert.rejects(saveRecord(db, 'alice', record(), 0), conflict(2));
  await assert.rejects(saveRecord(db, 'alice', record(), 1), conflict(2));
  await assert.rejects(deleteRecord(db, 'alice', 1), conflict(2));
  await assert.rejects(deleteRecord(db, 'bob', 2), conflict(0));
  assert.deepEqual(await readRecord(db, 'alice'), second);
  assert.deepEqual(await deleteRecord(db, 'alice', 2), { deleted: true });
  assert.equal(await readRecord(db, 'alice'), null);
});

test('simultaneous saves with the same version allow exactly one writer', async (t) => {
  const { db } = database(t);
  await saveRecord(db, 'alice', record(), 0);
  const results = await Promise.allSettled([
    saveRecord(db, 'alice', record({ language: 'en' }), 1),
    saveRecord(db, 'alice', record({ done: ['extension'] }), 1),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected' && conflict(2)(result.reason)).length, 1);
  assert.equal((await readRecord(db, 'alice'))?.version, 2);
});

test('authentication is required for every HTTP operation and the service itself', async (t) => {
  const { db } = database(t);
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const response = await handleRecordsRequest(request(method, { expectedVersion: 0, record: record(), confirm: true }, { user: null }), db);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), { error: 'sign_in_required' });
  }
  await assert.rejects(readRecord(db, ''), /sign_in_required/);
  await assert.rejects(saveRecord(db, ' ', record(), 0), /sign_in_required/);
  await assert.rejects(deleteRecord(db, '', 0), /sign_in_required/);
});

test('HTTP user identity comes only from the trusted header, never a selector in the URL or body', async (t) => {
  const { db } = database(t);
  await saveRecord(db, 'alice', record({ language: 'en' }), 0);
  const get = await handleRecordsRequest(request('GET', undefined, { user: 'bob', url: 'https://settlek.test/api/records?userId=alice' }), db);
  assert.deepEqual(await get.json(), { record: null });
  const rejected = await handleRecordsRequest(request('PUT', { expectedVersion: 1, userId: 'alice', record: record() }, { user: 'bob' }), db);
  assert.equal(rejected.status, 400);
  const ownSave = await handleRecordsRequest(request('PUT', { expectedVersion: 0, record: { ...record(), userId: 'alice' } }, { user: 'bob' }), db);
  assert.equal(ownSave.status, 200);
  assert.equal((await readRecord(db, 'alice'))?.state.language, 'en');
  assert.equal((await readRecord(db, 'bob'))?.state.language, 'ko');
  const sqlLikeUser = "x' OR 1=1 --";
  assert.equal(await readRecord(db, sqlLikeUser), null);
});

test('mutations require exact same origin and deletion requires explicit confirmation', async (t) => {
  const { db } = database(t);
  await saveRecord(db, 'alice', record(), 0);
  for (const origin of [null, 'https://attacker.test', 'http://settlek.test', 'https://settlek.test.attacker.test']) {
    for (const method of ['PUT', 'DELETE']) {
      const response = await handleRecordsRequest(request(method, { expectedVersion: 1, record: record(), confirm: true }, { origin }), db);
      assert.equal(response.status, 403);
    }
  }
  const missing = await handleRecordsRequest(request('DELETE', { expectedVersion: 1 }), db);
  assert.equal(missing.status, 400);
  assert.deepEqual(await missing.json(), { error: 'confirmation_required' });
  const removed = await handleRecordsRequest(request('DELETE', { expectedVersion: 1, confirm: true }), db);
  assert.equal(removed.status, 200);
  assert.deepEqual(await removed.json(), { deleted: true });
});

test('HTTP conflicts return safe own-version information, and database errors do not expose details', async (t) => {
  const { db } = database(t);
  await saveRecord(db, 'alice', record(), 0);
  const response = await handleRecordsRequest(request('PUT', { expectedVersion: 0, record: record() }), db);
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: 'version_conflict', currentVersion: 1 });
  const failing: RecordsDB = { prepare() { throw new Error('private database payload: never expose'); } };
  const failure = await handleRecordsRequest(request('GET'), failing);
  assert.equal(failure.status, 503);
  assert.equal(failure.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await failure.json(), { error: 'storage_unavailable' });
});

test('64 KB request limit counts encoded bytes even without a trustworthy content length', async (t) => {
  const { db } = database(t);
  const oversized = { expectedVersion: 0, record: record(), ignored: '가'.repeat(23000) };
  const response = await handleRecordsRequest(request('PUT', oversized, { headers: { 'Content-Length': '5' } }), db);
  assert.equal(response.status, 413);
  assert.equal(await readRecord(db, 'alice'), null);
  const header = await handleRecordsRequest(request('PUT', {}, { headers: { 'Content-Length': '65537' } }), db);
  assert.equal(header.status, 413);
  const malformed = await handleRecordsRequest(request('PUT', undefined, { raw: '{invalid json' }), db);
  assert.equal(malformed.status, 400);
});

test('raw notes are rejected while AI metadata and unsolicited properties are never saved', async (t) => {
  const { db, sqlite } = database(t);
  const original = record();
  assert.throws(() => sanitizeRecord({ ...original, profile: { ...original.profile, note: 'A private situation note.' } }), /note_not_saved/);
  assert.throws(() => sanitizeRecord({ ...original, profile: { ...original.profile, note: { private: true } } }), /note_not_saved/);
  const submitted = {
    ...original, rawAI: { summary: 'do-not-persist-this-marker' }, note: 'do-not-persist-this-marker',
    profile: { ...original.profile, rawAI: 'do-not-persist-this-marker', answers: { ...original.profile.answers, privateField: 'do-not-persist-this-marker' } },
    reminders: [{ ...reminder(), ai: 'do-not-persist-this-marker' }],
  };
  const saved = await saveRecord(db, 'alice', submitted, 0);
  assert.equal(saved.state.profile.note, '');
  assert.ok(!JSON.stringify(saved).includes('do-not-persist-this-marker'));
  const row = sqlite.prepare('SELECT payload FROM records WHERE user_id=?').get('alice');
  assert.ok(!String(row?.payload).includes('do-not-persist-this-marker'));
});

test('prototype-shaped keys are ignored and cannot become preparation or task state', () => {
  const original = record();
  const raw = JSON.parse(JSON.stringify(original));
  raw.prep = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"state":"done"}}');
  raw.done = ['__proto__', 'constructor', 'not-a-task', 'extension', 'extension'];
  raw.profile.answers = JSON.parse('{"housing":"lease","__proto__":{"polluted":true}}');
  raw.__proto__ = { shouldNotBeInherited: true };
  assert.throws(() => sanitizeRecord(raw), /invalid_record/);
  delete raw.__proto__;
  const clean = sanitizeRecord(JSON.parse(JSON.stringify({ ...original, prep: JSON.parse('{"__proto__":{"polluted":true}}'), done: ['__proto__', 'extension', 'extension'] })));
  assert.deepEqual(clean.done, ['extension']);
  assert.equal(Object.hasOwn(clean.prep, '__proto__'), false);
  assert.equal(Object.hasOwn(Object.prototype, 'polluted'), false);
});

test('preparation uses rebuilt contexts, invalidates changed housing, and preserves unrelated completion', () => {
  const original = record();
  for (const prep of Object.values(original.prep)) Object.assign(prep, { state: 'done', held: true, reuse: true, checkedAt: '2026-10-26T08:00:00.000Z' });
  const changed = sanitizeRecord({ ...original, profile: { ...original.profile, city: '부산' } });
  assert.equal(changed.prep.lease.state, 'todo');
  assert.equal(changed.prep.lease.held, true);
  assert.equal(changed.prep.lease.reuse, false);
  assert.equal(changed.prep.lease.checkedAt, undefined);
  assert.deepEqual(changed.prep.passport, original.prep.passport);
  const unheld = sanitizeRecord({ ...original, prep: { ...original.prep, passport: { ...original.prep.passport, held: false, reuse: true } } });
  assert.equal(unheld.prep.passport.reuse, false);
  const injected = sanitizeRecord({ ...original, prep: { ...original.prep, passport: { ...original.prep.passport, context: 'private@example.com' } } });
  assert.ok(!JSON.stringify(injected).includes('private@example.com'));
  assert.equal(injected.prep.passport.state, 'todo');
  const alternative = sanitizeRecord({ ...original, profile: { ...original.profile, answers: { housing: 'provided' } } });
  assert.equal(alternative.prep.lease, undefined);
  assert.equal(alternative.prep.accommodation.state, 'todo');
});

test('malformed preparation states and unbounded or noncanonical versions are rejected', async (t) => {
  const { db } = database(t);
  const original = record();
  assert.throws(() => sanitizeRecord({ ...original, prep: { passport: { ...original.prep.passport, state: 'approved' } } }), /invalid_preparation/);
  assert.throws(() => sanitizeRecord({ ...original, prep: { passport: { ...original.prep.passport, state: { toString: 'untrusted' } } } }), /invalid_preparation/);
  assert.throws(() => sanitizeRecord({ ...original, prep: { passport: { ...original.prep.passport, held: 'true' } } }), /invalid_preparation/);
  for (const version of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER]) await assert.rejects(saveRecord(db, 'alice', original, version), /invalid_version/);
});

test('reminders accept government HTTPS sources and reject misleading official links or sensitive text', () => {
  for (const source of ['https://www.gov.kr/portal', 'https://www.hikorea.go.kr/', 'https://www.moj.go.kr/', 'https://immigration.go.kr/', 'https://socinet.go.kr/', 'https://www.studyinkorea.go.kr/', 'https://law.go.kr/']) {
    assert.equal(sanitizeRecord(record({ reminders: [reminder({ kind: 'official', source })] })).reminders[0].source, source);
  }
  for (const source of ['', 'http://www.gov.kr/', 'https://gov.kr.attacker.test/', 'https://example.com/?next=https://gov.kr', 'https://user:password@gov.kr/', 'https://gov.kr:8443/', 'javascript:alert(1)']) {
    assert.throws(() => sanitizeRecord(record({ reminders: [reminder({ kind: 'official', source })] })), /invalid_official_source|sensitive_input/);
  }
  for (const title of ['Email example@example.com', 'Call 010-1234-5678', '900101-1234567']) {
    assert.throws(() => sanitizeRecord(record({ reminders: [reminder({ title })] })), /sensitive_input/);
  }
  assert.throws(() => sanitizeRecord(record({ reminders: [reminder({ source: 'https://gov.kr/?email=example@example.com', kind: 'official' })] })), /sensitive_input/);
});

test('malformed reminders, duplicate IDs and oversized lists are rejected; stale task links are dropped', () => {
  const bad: Partial<Reminder>[] = [
    { title: '' }, { title: 'x'.repeat(101) }, { date: '2026-02-30' },
    { leadDays: -1 }, { leadDays: 0.5 }, { leadDays: 366 }, { id: '__proto__' },
  ];
  for (const patch of bad) assert.throws(() => sanitizeRecord(record({ reminders: [reminder(patch)] })), /invalid_reminder/);
  assert.throws(() => sanitizeRecord(record({ reminders: [reminder(), reminder()] })), /invalid_reminder/);
  assert.throws(() => sanitizeRecord(record({ reminders: Array.from({ length: 51 }, (_, index) => reminder({ id: `r-${index}` })) })), /invalid_reminder/);
  const retained = sanitizeRecord(record({ reminders: [reminder({ taskId: 'extension' })] }));
  assert.equal(retained.reminders[0].taskId, 'extension');
  const stale = sanitizeRecord(record({ reminders: [reminder({ taskId: 'not-a-task' })] }));
  assert.equal(stale.reminders[0].taskId, undefined);
});

test('document and procedure history persists independently of current completion and reuse', async (t) => {
  const { db } = database(t);
  const original = record({ history: [event(), event({ id: 'history-2', kind: 'procedure', itemId: 'education', action: 'done' })] });
  const changed = { ...original, profile: { ...original.profile, answers: { housing: 'provided' } } };
  const saved = await saveRecord(db, 'alice', changed, 0);
  assert.deepEqual(saved.state.history, original.history);
  assert.deepEqual(saved.state.done, []);
  assert.equal(saved.state.prep.lease, undefined);
  assert.equal(saved.state.prep.accommodation.reuse, false);
  assert.equal(saved.state.prep.accommodation.state, 'todo');
  assert.deepEqual((await readRecord(db, 'alice'))?.state.history, original.history);
  assert.deepEqual(sanitizeRecord(record()).history, []);
});

test('history accepts only whitelisted IDs, bounded hashes and timestamps, with no freeform metadata', () => {
  const invalid: Partial<HistoryEntry>[] = [
    { itemId: '__proto__' }, { context: '{"private":"note"}' }, { context: 'private@example.com' },
    { context: 'x'.repeat(21) }, { at: '2026-10-26' }, { at: '2026-02-30T08:00:00.000Z' },
    { kind: 'procedure', itemId: 'not-a-task' },
  ];
  for (const patch of invalid) assert.throws(() => sanitizeRecord(record({ history: [event(patch)] })), /invalid_history/);
  assert.throws(() => sanitizeRecord(record({ history: Array.from({ length: 101 }, (_, index) => event({ id: `e-${index}` })) })), /invalid_history/);
  assert.throws(() => sanitizeRecord(record({ history: [event(), event()] })), /invalid_history/);
  const cleaned = sanitizeRecord({ ...record(), history: [{ ...event(), note: 'not-saved', ai: { raw: 'not-saved' } }] });
  assert.ok(!JSON.stringify(cleaned).includes('not-saved'));
});
