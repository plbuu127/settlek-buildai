import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, MAX_REQUESTS, MODEL } from '../lib/ai.ts';
import { cleanProfile, hasSensitiveText, validDate } from '../lib/validation.ts';
import { blankProfile } from '../lib/planner.ts';
import type { Profile } from '../lib/planner.ts';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    ...blankProfile(), status: 'resident', visa: 'F', goal: 'work', city: '서울',
    expiry: '2027-03-01', answers: { housing: 'lease', employment: 'offer' },
    ...overrides,
  };
}

// This adapter models only the three budget statements used by analyze.
// No network or persistent database is used by any test.
function budgetDB(initial: { used?: number; busyUntil?: number } = {}) {
  const state = { used: initial.used ?? 0, busyUntil: initial.busyUntil ?? 0, initializations: 0, reservations: 0, releases: 0 };
  const db = {
    prepare(sql: string) {
      let bindings: unknown[] = [];
      const statement = {
        bind(...values: unknown[]) { bindings = values; return statement; },
        async run() {
          if (sql.includes('INSERT OR IGNORE INTO ai_budget')) state.initializations++;
          else if (sql.includes('SET busy_until=0')) { state.busyUntil = 0; state.releases++; }
          else throw new Error(`Unexpected test database statement: ${sql}`);
          return { success: true };
        },
        async first<T>() {
          assert.ok(sql.includes('RETURNING used'));
          const [until, limit, now] = bindings.map(Number);
          if (state.used >= limit || state.busyUntil >= now) return null;
          state.used++;
          state.busyUntil = until;
          state.reservations++;
          return { used: state.used } as unknown as T;
        },
      };
      return statement;
    },
  };
  return { db, state };
}

function envFor(db: ReturnType<typeof budgetDB>['db']) {
  return { NEBIUS_API_KEY: 'test-key-not-a-real-secret', NEBIUS_AI_ENABLED: 'true', DB: db } as unknown as Parameters<typeof analyze>[2];
}

const summary = { summaryKo: '채용 제안을 받은 상황입니다.', summaryEn: 'You have received a job offer.', facts: [] };
function providerResponse(content: unknown = summary, overrides: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({
    id: 'provider-request-42', model: 'provider-reported-model', usage: { total_tokens: 137 },
    choices: [{ finish_reason: 'stop', message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }],
    ...overrides,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

test('notes require explicit consent before reservation or provider calls', async (t) => {
  const { db, state } = budgetDB();
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => providerResponse());
  await assert.rejects(analyze(profile({ note: 'I have a job offer.' }), false, envFor(db)), /consent_required/);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(state.initializations, 0);
  assert.equal(state.reservations, 0);
});

test('an empty note can use structured answers without note consent', async (t) => {
  const { db } = budgetDB();
  let submitted: any;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    assert.ok(init);
    submitted = JSON.parse(String(init.body));
    return providerResponse();
  });
  const result = await analyze(profile(), false, envFor(db));
  const user = JSON.parse(submitted.messages.find((message: any) => message.role === 'user').content);
  assert.equal(user.note, '');
  assert.equal(Object.hasOwn(user.profile, 'note'), false);
  assert.equal(user.profile.answers.employment, 'offer');
  assert.equal(result.meta.mode, 'live');
});

test('budget exhaustion blocks provider calls without acquiring or releasing a reservation', async (t) => {
  const { db, state } = budgetDB({ used: MAX_REQUESTS });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => providerResponse());
  await assert.rejects(analyze(profile(), false, envFor(db)), /budget_or_busy/);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(state.used, MAX_REQUESTS);
  assert.equal(state.reservations, 0);
  assert.equal(state.releases, 0);
});

test('an active reservation blocks a concurrent provider call', async (t) => {
  const { db, state } = budgetDB({ busyUntil: Date.now() + 75000 });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => providerResponse());
  await assert.rejects(analyze(profile(), false, envFor(db)), /budget_or_busy/);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(state.used, 0);
  assert.equal(state.releases, 0);
});

test('successful results use provider metadata and release the shared reservation', async (t) => {
  const { db, state } = budgetDB({ used: 4 });
  let submitted: any;
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url: unknown, init?: RequestInit) => {
    assert.ok(init);
    assert.equal(url, 'https://api.tokenfactory.nebius.com/v1/chat/completions');
    assert.equal(init.method, 'POST');
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test-key-not-a-real-secret');
    submitted = JSON.parse(String(init.body));
    assert.equal(state.used, 5, 'the request is reserved before fetch');
    assert.ok(state.busyUntil > Date.now());
    return providerResponse();
  });
  const result = await analyze(profile({ note: 'I have a job offer.' }), true, envFor(db));
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(submitted.model, MODEL);
  assert.equal(submitted.response_format.json_schema.strict, true);
  assert.equal(JSON.parse(submitted.messages[1].content).note, 'I have a job offer.');
  assert.deepEqual(result.summary, { ko: summary.summaryKo, en: summary.summaryEn });
  assert.equal(result.meta.mode, 'live');
  assert.equal(result.meta.provider, 'Nebius Token Factory');
  assert.equal(result.meta.model, 'provider-reported-model');
  assert.equal(result.meta.requestId, 'provider-request-42');
  assert.equal(result.meta.tokens, 137);
  assert.equal(result.meta.remaining, MAX_REQUESTS - 5);
  assert.ok(Number.isFinite(Date.parse(result.meta.at)));
  assert.ok(result.meta.durationMs >= 0);
  assert.equal(state.busyUntil, 0);
  assert.equal(state.releases, 1);
});

test('malformed JSON, invalid response shapes, and truncated output cannot become successful results', async (t) => {
  const cases = [
    { name: 'malformed JSON', response: () => providerResponse('{not json') },
    { name: 'missing English summary', response: () => providerResponse({ summaryKo: '요약', facts: [] }) },
    { name: 'non-array facts', response: () => providerResponse({ ...summary, facts: {} }) },
    { name: 'non-string summary', response: () => providerResponse({ ...summary, summaryKo: 3 }) },
    { name: 'empty Korean summary', response: () => providerResponse({ ...summary, summaryKo: '' }) },
    { name: 'empty English summary', response: () => providerResponse({ ...summary, summaryEn: '' }) },
    { name: 'whitespace-only Korean summary', response: () => providerResponse({ ...summary, summaryKo: ' \n\t ' }) },
    { name: 'whitespace-only English summary', response: () => providerResponse({ ...summary, summaryEn: ' \n\t ' }) },
    { name: 'sensitive summary', response: () => providerResponse({ ...summary, summaryEn: 'Contact example@example.com.' }) },
    { name: 'null result', response: () => providerResponse(null) },
    { name: 'truncated output', response: () => providerResponse(summary, { choices: [{ finish_reason: 'length', message: { content: JSON.stringify(summary) } }] }) },
  ];
  for (const item of cases) await t.test(item.name, async (subtest) => {
    const { db, state } = budgetDB();
    subtest.mock.method(globalThis, 'fetch', async () => item.response());
    await assert.rejects(analyze(profile(), false, envFor(db)));
    assert.equal(state.used, 1);
    assert.equal(state.busyUntil, 0);
    assert.equal(state.releases, 1);
  });
});

test('extracted facts require an exact evidence substring and a value allowed for that field', async (t) => {
  const { db } = budgetDB();
  const note = '회사 숙소에서 살고 있어요. I have a job offer. 저는 졸업했어요.';
  const allowed = [
    { field: 'housing', value: 'provided', evidence: '회사 숙소' },
    { field: 'employment', value: 'offer', evidence: 'job offer' },
    { field: 'study', value: 'graduated', evidence: '졸업했어요' },
  ];
  const rejected = [
    { field: 'visa', value: 'F-5', evidence: '회사 숙소' },
    { field: 'housing', value: 'working', evidence: '회사 숙소' },
    { field: 'employment', value: 'offer', evidence: 'Job Offer' },
    { field: 'housing', value: 'provided', evidence: 'employer housing' },
    { field: 'employment', value: 'offer', evidence: 'I' },
    { field: 'housing', value: 'provided', evidence: 123 },
    { field: 'housing', value: 'provided', evidence: '' },
    null,
  ];
  t.mock.method(globalThis, 'fetch', async () => providerResponse({ ...summary, facts: [...allowed, ...rejected] }));
  const result = await analyze(profile({ note }), true, envFor(db));
  assert.deepEqual(result.facts, allowed);
});

test('non-string and inherited-property fact fields are rejected rather than coerced or executed', async (t) => {
  const { db } = budgetDB();
  const valid = { field: 'housing', value: 'provided', evidence: '회사 숙소' };
  t.mock.method(globalThis, 'fetch', async () => providerResponse({
    ...summary,
    facts: [
      valid,
      { field: ['housing'], value: 'provided', evidence: '회사 숙소' },
      { field: 'constructor', value: 'provided', evidence: '회사 숙소' },
      { field: 'toString', value: 'provided', evidence: '회사 숙소' },
    ],
  }));
  const result = await analyze(profile({ note: '회사 숙소에서 살고 있어요.' }), true, envFor(db));
  assert.deepEqual(result.facts, [valid]);
});

test('supported conflicting facts remain separate for explicit user resolution', async (t) => {
  const { db } = budgetDB();
  const note = 'I am currently working. I have an offer from another company.';
  const facts = [
    { field: 'employment', value: 'working', evidence: 'currently working' },
    { field: 'employment', value: 'offer', evidence: 'offer from another company' },
  ];
  t.mock.method(globalThis, 'fetch', async () => providerResponse({ ...summary, facts }));
  const result = await analyze(profile({ note }), true, envFor(db));
  assert.deepEqual(result.facts, facts, 'the server does not silently choose a winner for one field');
});

test('provider HTTP failures and network failures release reservations without refunding request count', async (t) => {
  for (const failure of ['http', 'network'] as const) await t.test(failure, async (subtest) => {
    const { db, state } = budgetDB();
    let calls = 0;
    subtest.mock.method(globalThis, 'fetch', async () => {
      calls++;
      if (calls === 1) {
        if (failure === 'network') throw new Error('test-network-failure');
        return new Response('Unavailable', { status: 503 });
      }
      return providerResponse();
    });
    await assert.rejects(analyze(profile(), false, envFor(db)), failure === 'network' ? /test-network-failure/ : /provider_unavailable/);
    assert.equal(state.busyUntil, 0);
    assert.equal(state.releases, 1);
    assert.equal(state.used, 1);
    await analyze(profile(), false, envFor(db));
    assert.equal(calls, 2, 'the next request is not left blocked by a failed provider call');
    assert.equal(state.used, 2);
    assert.equal(state.releases, 2);
  });
});

test('provider rate limits retain a distinct failure result and release the reservation', async (t) => {
  const { db, state } = budgetDB();
  t.mock.method(globalThis, 'fetch', async () => new Response('Rate limited', { status: 429 }));
  await assert.rejects(analyze(profile(), false, envFor(db)), /provider_busy/);
  assert.equal(state.busyUntil, 0);
  assert.equal(state.releases, 1);
});

test('missing provider configuration or storage cannot call the provider', async (t) => {
  const { db } = budgetDB();
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => providerResponse());
  await assert.rejects(analyze(profile(), false, { ...envFor(db), NEBIUS_API_KEY: '' }), /not_configured/);
  await assert.rejects(analyze(profile(), false, { ...envFor(db), NEBIUS_AI_ENABLED: 'false' }), /not_configured/);
  await assert.rejects(analyze(profile(), false, { ...envFor(db), DB: undefined } as unknown as Parameters<typeof analyze>[2]), /storage_unavailable/);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('sensitive-text validation catches supported identifiers without blocking ordinary situation notes', () => {
  for (const text of [
    'Email: example@example.com', '연락처 010-1234-5678', '01012345678',
    '등록번호 900101-1234567', '9001011234567', 'key sk-proj-examplefakevalue', 'nvapi-examplefakevalue123',
  ]) {
    assert.equal(hasSensitiveText(text), true, text);
    assert.throws(() => cleanProfile(profile({ note: text })), /sensitive_input/);
  }
  for (const text of ['I have a job offer.', '회사 숙소에서 살고 있어요.', '만료일은 2027-03-01입니다.']) {
    assert.equal(hasSensitiveText(text), false, text);
    assert.equal(cleanProfile(profile({ note: text })).note, text);
  }
});

test('date validation rejects impossible dates, out-of-range years, and noncanonical forms', () => {
  for (const date of ['2024-02-29', '2000-02-29', '1900-01-01', '2200-12-31']) assert.equal(validDate(date), true, date);
  for (const date of ['2025-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '1899-12-31', '2201-01-01', '2026-01-01suffix', '', null, 20260101]) assert.equal(validDate(date), false, String(date));
  assert.throws(() => cleanProfile(profile({ expiry: '2026-02-30' })), /invalid_date/);
  assert.throws(() => cleanProfile(profile({ answers: { moveDate: '2026-02-30' } })), /invalid_date/);
  assert.throws(() => cleanProfile(profile({ answers: { expiry: 'tomorrow' } })), /invalid_date/);
  assert.equal(cleanProfile(profile({ answers: { expiry: 'unknown' } })).answers.expiry, 'unknown');
});

test('profile expiry is validated as supplied rather than accepting a truncated date prefix', () => {
  assert.throws(() => cleanProfile(profile({ expiry: '2026-01-01suffix' })), /invalid_input|invalid_date/);
});

test('profile validation rejects invalid core choices and removes unknown properties and events', () => {
  for (const invalid of [null, [], {}, { ...profile(), status: 'administrator' }, { ...profile(), visa: 'made-up-visa' }, { ...profile(), goal: 'legal-approval' }, { ...profile(), city: 'private@example.com' }, { ...profile(), note: 'x'.repeat(1201) }, { ...profile(), expiry: 20260101 }]) {
    assert.throws(() => cleanProfile(invalid), /invalid_input/);
  }
  const raw = {
    ...profile(), status: ' resident ', city: ' 서울 ', note: '  A job offer.  ',
    events: ['moved', 'moved', 'extension', 'invented-event', 2],
    answers: { housing: 'provided', employment: 'unknown', injected: 'not forwarded' },
    arbitrary: 'not forwarded',
  };
  const result = cleanProfile(raw);
  assert.equal(result.status, 'resident');
  assert.equal(result.city, '서울');
  assert.equal(result.note, 'A job offer.');
  assert.deepEqual(result.events, ['moved', 'extension']);
  assert.deepEqual(result.answers, { housing: 'provided', employment: 'unknown' });
  assert.equal(Object.hasOwn(result, 'arbitrary'), false);
  assert.equal(raw.note, '  A job offer.  ', 'validation does not mutate the source profile');
});

test('selected-answer values must belong to their declared choices', () => {
  const cases: Record<string, string>[] = [
    { housing: 'working' }, { employment: 'provided' }, { study: 'approved' },
    { integration: 'visa-granted' }, { addressReported: 'sometimes' },
    { housing: 'private@example.com' },
  ];
  for (const answers of cases) assert.throws(() => cleanProfile(profile({ answers })), /invalid_input|sensitive_input/);
});

test('invalid answer types and unknown keys are removed before structured data reaches the provider', async (t) => {
  const { db } = budgetDB();
  const cleaned = cleanProfile({
    ...profile(),
    answers: {
      housing: { private: 'private@example.com' }, employment: 42, study: null,
      integration: false, expiry: [], moveDate: { date: '2026-01-01' },
      addressReported: 1, privateField: 'private@example.com',
    },
  });
  assert.deepEqual(cleaned.answers, {});
  let submitted: any;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    assert.ok(init);
    submitted = JSON.parse(String(init.body));
    return providerResponse();
  });
  await analyze(cleaned, false, envFor(db));
  const user = JSON.parse(submitted.messages[1].content);
  assert.deepEqual(user.profile.answers, {});
  assert.ok(!submitted.messages[1].content.includes('private@example.com'));
});

test('explicit unknown answers remain valid values for later clarification', () => {
  const answers = {
    housing: 'unknown', employment: 'unknown', study: 'unknown', integration: 'unknown',
    expiry: 'unknown', moveDate: 'unknown', addressReported: 'unknown',
  };
  assert.deepEqual(cleanProfile(profile({ answers })).answers, answers);
});
