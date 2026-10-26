import { buildPlan, reconcilePreparation } from './planner.ts';
import type { Locale, Prep, Profile } from './planner.ts';
import { cleanProfile, hasSensitiveText, validDate } from './validation.ts';
import { documentCatalog } from '../data/catalog.ts';

export type Reminder = {
  id: string;
  title: string;
  date: string;
  kind: 'personal' | 'official' | 'other';
  source: string;
  leadDays: number;
  done: boolean;
  taskId?: string;
};
export type SavedRecord = {
  profile: Profile;
  prep: Record<string, Prep>;
  done: string[];
  reminders: Reminder[];
  language: Locale;
  history?: HistoryEntry[];
};
export type HistoryEntry = {
  id: string;
  kind: 'document' | 'procedure';
  itemId: string;
  action: 'held' | 'ready' | 'reused' | 'done' | 'undo' | 'unheld';
  at: string;
  context: string;
};
export type StoredRecord = { state: SavedRecord; version: number; updatedAt: string };
type Statement = {
  bind(...values: (string | number | null)[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
};
export type RecordsDB = { prepare(query: string): Statement };
type Row = { payload: string; version: number; updated_at: string };

export class RecordError extends Error {
  status: number;
  currentVersion?: number;
  constructor(code: string, status = 400, currentVersion?: number) {
    super(code);
    this.name = 'RecordError';
    this.status = status;
    this.currentVersion = currentVersion;
  }
}

const MAX_BYTES = 64 * 1024;
const own = (object: Record<string, unknown>, key: string) => Object.hasOwn(object, key) ? object[key] : undefined;
function object(input: unknown, code = 'invalid_record'): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new RecordError(code);
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) throw new RecordError(code);
  return input as Record<string, unknown>;
}
function boundedString(input: unknown, maximum: number, code: string, allowEmpty = false): string {
  if (typeof input !== 'string' || input.length > maximum) throw new RecordError(code);
  const result = input.trim();
  if (!allowEmpty && !result) throw new RecordError(code);
  return result;
}
function checkVersion(input: unknown): number {
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 0 || input >= Number.MAX_SAFE_INTEGER) {
    throw new RecordError('invalid_version');
  }
  return input;
}
function requireUser(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId.trim() || userId.length > 512) throw new RecordError('sign_in_required', 401);
}
function requireDB(db: RecordsDB | null | undefined): asserts db is RecordsDB {
  if (!db || typeof db.prepare !== 'function') throw new RecordError('storage_unavailable', 503);
}
function validCheckedAt(input: unknown): input is string {
  if (typeof input !== 'string') return false;
  if (validDate(input)) return true;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input) || !validDate(input.slice(0, 10))) return false;
  const date = new Date(input);
  return !Number.isNaN(date.getTime()) && date.toISOString() === input;
}
function officialSource(source: string): boolean {
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    const government = ['gov.kr', 'moj.go.kr', 'immigration.go.kr', 'hikorea.go.kr', 'socinet.go.kr', 'studyinkorea.go.kr', 'law.go.kr', 'mofa.go.kr'];
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && government.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch { return false; }
}

export function sanitizeRecord(raw: unknown): SavedRecord {
  const input = object(raw);
  const rawProfile = object(own(input, 'profile'));
  const note = own(rawProfile, 'note');
  if (note !== undefined && note !== '') throw new RecordError('note_not_saved');
  const selected: Record<string, unknown> = {};
  for (const key of ['status', 'visa', 'expiry', 'goal', 'city', 'events']) {
    if (Object.hasOwn(rawProfile, key)) selected[key] = rawProfile[key];
  }
  const rawAnswers = own(rawProfile, 'answers');
  if (rawAnswers !== undefined) {
    const answers = object(rawAnswers);
    selected.answers = Object.fromEntries(
      ['housing', 'employment', 'study', 'integration', 'expiry', 'moveDate', 'addressReported']
        .filter((key) => Object.hasOwn(answers, key))
        .map((key) => [key, answers[key]]),
    );
  }
  selected.note = '';
  let profile: Profile;
  try { profile = cleanProfile(selected); }
  catch (error) {
    const code = error instanceof Error ? error.message : '';
    throw new RecordError(['invalid_input', 'invalid_date', 'sensitive_input'].includes(code) ? code : 'invalid_record');
  }
  const language = own(input, 'language');
  if (language !== 'ko' && language !== 'en') throw new RecordError('invalid_record');
  const plan = buildPlan(profile);
  const tasks = new Set(plan.tasks.map((task) => task.id));
  const incomingPrep = object(own(input, 'prep'), 'invalid_preparation');
  const checkedPrep: Record<string, Prep> = {};
  for (const document of plan.documents) {
    if (!Object.hasOwn(incomingPrep, document.id)) continue;
    const item = object(incomingPrep[document.id], 'invalid_preparation');
    const state = own(item, 'state');
    const held = own(item, 'held');
    const reuse = own(item, 'reuse');
    if (typeof state !== 'string' || !['todo', 'doing', 'done'].includes(state)
      || typeof held !== 'boolean' || typeof reuse !== 'boolean') throw new RecordError('invalid_preparation');
    // The submitted context is only compared; stored contexts are rebuilt below.
    const matching = own(item, 'context') === document.context;
    const prep: Prep = {
      state: matching ? state as Prep['state'] : 'todo', held, reuse: matching && held && reuse,
      context: document.context,
    };
    const checkedAt = own(item, 'checkedAt');
    if (checkedAt !== undefined && !validCheckedAt(checkedAt)) throw new RecordError('invalid_preparation');
    if (matching && typeof checkedAt === 'string') prep.checkedAt = checkedAt;
    checkedPrep[document.id] = prep;
  }
  const prep = reconcilePreparation(checkedPrep, plan);
  const incomingDone = own(input, 'done');
  if (!Array.isArray(incomingDone)) throw new RecordError('invalid_record');
  const done = [...new Set(incomingDone.filter((id): id is string => typeof id === 'string' && tasks.has(id)))];
  const incomingReminders = own(input, 'reminders');
  if (!Array.isArray(incomingReminders) || incomingReminders.length > 50) throw new RecordError('invalid_reminder');
  const reminderIds = new Set<string>();
  const reminders = incomingReminders.map((rawReminder): Reminder => {
    const item = object(rawReminder, 'invalid_reminder');
    const id = boundedString(own(item, 'id'), 80, 'invalid_reminder');
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id) || reminderIds.has(id)) throw new RecordError('invalid_reminder');
    reminderIds.add(id);
    const title = boundedString(own(item, 'title'), 100, 'invalid_reminder');
    const date = own(item, 'date');
    const kind = own(item, 'kind');
    const source = boundedString(own(item, 'source'), 2048, 'invalid_reminder', true);
    const leadDays = own(item, 'leadDays');
    const reminderDone = own(item, 'done');
    if (!validDate(date) || typeof date !== 'string' || typeof kind !== 'string' || !['personal', 'official', 'other'].includes(kind)
      || typeof leadDays !== 'number' || !Number.isInteger(leadDays) || leadDays < 0 || leadDays > 365
      || typeof reminderDone !== 'boolean') throw new RecordError('invalid_reminder');
    if (hasSensitiveText(title) || hasSensitiveText(source)) throw new RecordError('sensitive_input');
    if (kind === 'official' && !officialSource(source)) throw new RecordError('invalid_official_source');
    const reminder: Reminder = { id, title, date, kind: kind as Reminder['kind'], source, leadDays, done: reminderDone };
    const taskId = own(item, 'taskId');
    if (taskId !== undefined && typeof taskId !== 'string') throw new RecordError('invalid_reminder');
    if (typeof taskId === 'string' && tasks.has(taskId)) reminder.taskId = taskId;
    return reminder;
  });
  const incomingHistory = own(input, 'history') === undefined ? [] : own(input, 'history');
  if (!Array.isArray(incomingHistory) || incomingHistory.length > 100) throw new RecordError('invalid_history');
  const historyIds = new Set<string>();
  const procedureIds = ['address', 'extension', 'stay-check', 'work', 'education', 'integration', 'check-route'];
  const history = incomingHistory.map((rawEntry): HistoryEntry => {
    const entry = object(rawEntry, 'invalid_history');
    const id = boundedString(own(entry, 'id'), 80, 'invalid_history');
    const kind = own(entry, 'kind');
    const itemId = own(entry, 'itemId');
    const action = own(entry, 'action');
    const at = own(entry, 'at');
    const context = own(entry, 'context');
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id) || historyIds.has(id)
      || (kind !== 'document' && kind !== 'procedure') || typeof itemId !== 'string'
      || (kind === 'document' ? !Object.hasOwn(documentCatalog, itemId) : !procedureIds.includes(itemId))
      || typeof action !== 'string' || !['held', 'ready', 'reused', 'done', 'undo', 'unheld'].includes(action)
      || typeof at !== 'string' || !at.includes('T') || !validCheckedAt(at)
      || typeof context !== 'string' || !/^[a-z0-9]{1,20}$/.test(context)) throw new RecordError('invalid_history');
    historyIds.add(id);
    return { id, kind, itemId, action: action as HistoryEntry['action'], at, context };
  });
  return { profile, prep, done, reminders, language, history };
}

function envelope(row: Row): StoredRecord {
  try {
    if (!Number.isSafeInteger(row.version) || row.version < 1 || typeof row.updated_at !== 'string') throw new Error('invalid_row');
    return { state: sanitizeRecord(JSON.parse(row.payload)), version: row.version, updatedAt: row.updated_at };
  } catch { throw new RecordError('record_unavailable', 503); }
}
async function conflict(db: RecordsDB, userId: string): Promise<never> {
  const current = await db.prepare('SELECT version FROM records WHERE user_id=?').bind(userId).first<{ version: number }>();
  throw new RecordError('version_conflict', 409, current?.version ?? 0);
}

export async function readRecord(db: RecordsDB | null | undefined, userId: string): Promise<StoredRecord | null> {
  requireUser(userId);
  requireDB(db);
  const row = await db.prepare('SELECT payload,version,updated_at FROM records WHERE user_id=?').bind(userId).first<Row>();
  return row ? envelope(row) : null;
}
export async function saveRecord(db: RecordsDB | null | undefined, userId: string, raw: unknown, expectedVersion: number): Promise<StoredRecord> {
  requireUser(userId);
  requireDB(db);
  checkVersion(expectedVersion);
  const state = sanitizeRecord(raw);
  const payload = JSON.stringify(state);
  if (new TextEncoder().encode(payload).byteLength > MAX_BYTES) throw new RecordError('input_too_large', 413);
  const now = new Date().toISOString();
  const row = expectedVersion === 0
    ? await db.prepare('INSERT INTO records (user_id,payload,version,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING RETURNING payload,version,updated_at').bind(userId, payload, now).first<Row>()
    : await db.prepare('UPDATE records SET payload=?,version=version+1,updated_at=? WHERE user_id=? AND version=? RETURNING payload,version,updated_at').bind(payload, now, userId, expectedVersion).first<Row>();
  if (!row) return conflict(db, userId);
  return envelope(row);
}
export async function deleteRecord(db: RecordsDB | null | undefined, userId: string, expectedVersion: number): Promise<{ deleted: true }> {
  requireUser(userId);
  requireDB(db);
  checkVersion(expectedVersion);
  const deleted = await db.prepare('DELETE FROM records WHERE user_id=? AND version=? RETURNING version').bind(userId, expectedVersion).first<{ version: number }>();
  if (!deleted) return conflict(db, userId);
  return { deleted: true };
}

async function requestBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) throw new RecordError('input_too_large', 413);
  if (!request.body) throw new RecordError('invalid_input');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new RecordError('input_too_large', 413); }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return object(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)), 'invalid_input'); }
  catch (error) {
    if (error instanceof RecordError) throw error;
    throw new RecordError('invalid_input');
  }
}

// Kept independent of the runtime binding so HTTP authorization is unit-testable.
export async function handleRecordsRequest(request: Request, db: RecordsDB | null | undefined): Promise<Response> {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    const userId = request.headers.get('oai-authenticated-user-id');
    requireUser(userId);
    if (request.method === 'GET') return json({ record: await readRecord(db, userId) });
    if (!['PUT', 'DELETE'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new RecordError('invalid_origin', 403);
    const body = await requestBody(request);
    if (Object.hasOwn(body, 'userId') || Object.hasOwn(body, 'user_id')) throw new RecordError('invalid_input');
    const expectedVersion = checkVersion(own(body, 'expectedVersion'));
    if (request.method === 'PUT') return json({ record: await saveRecord(db, userId, own(body, 'record'), expectedVersion) });
    if (own(body, 'confirm') !== true) throw new RecordError('confirmation_required');
    return json(await deleteRecord(db, userId, expectedVersion));
  } catch (error) {
    if (error instanceof RecordError) {
      return json({ error: error.message, ...(error.currentVersion === undefined ? {} : { currentVersion: error.currentVersion }) }, error.status);
    }
    return json({ error: 'storage_unavailable' }, 503);
  }
}
