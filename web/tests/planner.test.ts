import test from 'node:test';
import assert from 'node:assert/strict';
import { blankProfile, buildPlan, questionsFor, reconcilePreparation } from '../lib/planner.ts';
import type { Plan, Prep, Profile } from '../lib/planner.ts';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    ...blankProfile(),
    status: 'resident', visa: 'F-2', goal: 'stay', city: 'Seoul',
    expiry: '2027-03-01', answers: { housing: 'lease' },
    ...overrides,
  };
}
const ids = (plan: Plan) => plan.documents.map((document) => document.id);
const questionIds = (p: Profile) => questionsFor(p).map((question) => question.id);
function completed(plan: Plan): Record<string, Prep> {
  return Object.fromEntries(plan.documents.map((document) => [document.id, {
    state: 'done' as const, held: true, reuse: true,
    context: document.context, checkedAt: '2026-10-26',
  }]));
}

test('housing answers choose one evidence alternative instead of appending every proof', () => {
  const leased = ids(buildPlan(profile()));
  const provided = ids(buildPlan(profile({ answers: { housing: 'provided' } })));
  const unknown = ids(buildPlan(profile({ answers: { housing: 'unknown' } })));
  assert.ok(leased.includes('lease'));
  assert.ok(!leased.includes('accommodation'));
  assert.ok(provided.includes('accommodation'));
  assert.ok(!provided.includes('lease'));
  assert.ok(!provided.includes('residenceProviderID'));
  assert.ok(unknown.includes('consultationChecklist'));
  assert.ok(!unknown.includes('lease'));
  assert.ok(!unknown.includes('accommodation'));
});

test('employment stages produce materially different candidate lists', () => {
  const withEmployment = (employment: string) => buildPlan(profile({ visa: 'E-7-1', goal: 'work', answers: { housing: 'lease', employment } }));
  const offer = ids(withEmployment('offer'));
  const working = ids(withEmployment('working'));
  const searching = ids(withEmployment('searching'));
  const unknown = ids(withEmployment('unknown'));
  assert.ok(offer.includes('employmentContract') && offer.includes('employerRegistration'));
  assert.ok(!offer.includes('jobSearchPlan') && !offer.includes('employmentProof'));
  assert.ok(working.includes('employmentProof') && !working.includes('employerRegistration'));
  assert.ok(searching.includes('jobSearchPlan') && !searching.includes('employmentContract'));
  assert.ok(unknown.includes('consultationChecklist'));
  assert.ok(!unknown.includes('employmentContract') && !unknown.includes('jobSearchPlan'));
  for (const document of withEmployment('offer').documents) {
    if (['employmentContract', 'employerRegistration'].includes(document.id)) {
      assert.notEqual(document.classification, 'official');
    }
  }
});

test('explicit unknown answers stop repeated questions and retain a concrete next step', () => {
  const p = profile({
    visa: 'unknown', expiry: '', goal: 'work', events: ['moved', 'extension', 'education', 'integration'],
    answers: { housing: 'unknown', employment: 'unknown', study: 'unknown', integration: 'unknown', addressReported: 'unknown', expiry: 'unknown' },
  });
  assert.deepEqual(questionIds(p), []);
  const plan = buildPlan(p);
  assert.ok(plan.tasks.length >= 5);
  assert.ok(ids(plan).includes('consultationChecklist'));
  assert.ok(!ids(plan).includes('lease'));
  assert.ok(!ids(plan).includes('enrollment'));
  assert.ok(!ids(plan).includes('kiip'));
});

test('only missing relevant questions are asked, and known events supply answers', () => {
  const searching = profile({ visa: 'D-10-1', goal: 'work', events: ['searching'], answers: {} });
  assert.deepEqual(questionIds(searching), ['housing']);
  assert.ok(ids(buildPlan(searching)).includes('jobSearchPlan'));
  const integrating = profile({ status: 'student', goal: 'integration', answers: {} });
  assert.deepEqual(questionIds(integrating), ['integration']);
  assert.ok(!ids(buildPlan(integrating)).includes('enrollment'));
  const known = profile({ goal: 'work', answers: { employment: 'offer', housing: 'provided' } });
  assert.deepEqual(questionIds(known), []);
});

test('student and worker extension plans differ without treating every resident as a student', () => {
  const student = buildPlan(profile({ status: 'student', visa: 'D-2' }));
  const worker = buildPlan(profile({ status: 'worker', visa: 'E-7' }));
  assert.ok(ids(student).includes('enrollment'));
  assert.ok(ids(student).includes('balance'));
  assert.ok(!ids(student).includes('employmentProof'));
  assert.ok(ids(worker).includes('employmentProof'));
  assert.ok(!ids(worker).includes('enrollment'));
  assert.ok(!questionIds(profile({ status: 'student', visa: 'D-2' })).includes('study'));
  assert.ok(!questionIds(profile({ status: 'worker', visa: 'E-7' })).includes('employment'));
});

test('graduation changes the education candidates, and KIIP records appear only after participation', () => {
  const graduated = buildPlan(profile({ status: 'student', events: ['graduation'] }));
  assert.ok(ids(graduated).includes('graduation'));
  assert.ok(!ids(graduated).includes('enrollment'));
  assert.ok(!ids(graduated).includes('balance'));
  const interested = buildPlan(profile({ goal: 'integration', answers: { integration: 'interested' } }));
  const completedKiip = buildPlan(profile({ goal: 'integration', answers: { integration: 'completed' } }));
  assert.ok(!ids(interested).includes('kiip'));
  assert.ok(ids(completedKiip).includes('kiip'));
  assert.ok(!ids(completedKiip).includes('criminalRecord'));
});

test('moving to another city invalidates housing reuse while preserving unrelated completed documents', () => {
  const oldPlan = buildPlan(profile({ status: 'worker', visa: 'E-7' }));
  const previous = completed(oldPlan);
  const next = buildPlan(profile({ status: 'worker', visa: 'E-7', city: 'Busan' }));
  const preparation = reconcilePreparation(previous, next);
  assert.equal(preparation.lease.state, 'todo');
  assert.equal(preparation.lease.reuse, false);
  assert.equal(preparation.lease.held, true);
  assert.equal(preparation.lease.checkedAt, undefined);
  assert.deepEqual(preparation.passport, previous.passport);
  assert.deepEqual(preparation.employmentContract, previous.employmentContract);
  assert.notEqual(preparation.passport, previous.passport, 'reconciliation returns a fresh object');
  assert.equal(previous.lease.state, 'done', 'the previous state is not mutated');
});

test('switching housing alternatives removes obsolete preparation but preserves identity completion', () => {
  const prior = completed(buildPlan(profile()));
  const next = buildPlan(profile({ answers: { housing: 'provided' } }));
  const result = reconcilePreparation(prior, next);
  assert.equal(result.lease, undefined);
  assert.deepEqual(result.passport, prior.passport);
  assert.equal(result.accommodation.state, 'todo');
  assert.equal(result.accommodation.held, false);
  assert.equal(result.accommodation.reuse, false);
});

test('irrelevant profile notes do not erase preparation or change the plan fingerprint', () => {
  const oldPlan = buildPlan(profile());
  const newPlan = buildPlan(profile({ note: 'Prefer an afternoon visit.' }));
  assert.equal(newPlan.fingerprint, oldPlan.fingerprint);
  assert.deepEqual(reconcilePreparation(completed(oldPlan), newPlan), completed(oldPlan));
});

test('address-only plan uses one identity and one residence-evidence alternative', () => {
  const addressOnly = profile({ goal: '', events: ['moved'], answers: { housing: 'lease', addressReported: 'no' } });
  const plan = buildPlan(addressOnly);
  assert.equal(ids(plan).filter((id) => ['passport', 'residenceCard'].includes(id)).length, 1);
  assert.equal(ids(plan).filter((id) => ['lease', 'accommodation'].includes(id)).length, 1);
  const reported = buildPlan({ ...addressOnly, answers: { addressReported: 'yes' } });
  assert.ok(!ids(reported).includes('lease'));
  assert.ok(!questionIds({ ...addressOnly, answers: { addressReported: 'yes' } }).includes('housing'));
});

test('F-5 does not receive ordinary extension paperwork or an expiry question', () => {
  const p = profile({ visa: 'F-5', expiry: '', events: ['extension'], answers: {} });
  const plan = buildPlan(p);
  assert.ok(plan.tasks.some((task) => task.id === 'stay-check'));
  assert.ok(!plan.tasks.some((task) => task.id === 'extension'));
  assert.ok(!ids(plan).includes('application'));
  assert.ok(!questionIds(p).includes('expiry'));
  assert.ok(ids(plan).includes('consultationChecklist'));
});

test('overlapping events deduplicate documents and never add unverified universal requirements', () => {
  const plan = buildPlan(profile({
    status: 'student', visa: 'D-2', goal: 'work',
    events: ['moved', 'extension', 'employed', 'education', 'integration'],
    answers: { housing: 'provided', employment: 'working', integration: 'completed', addressReported: 'no' },
  }));
  assert.equal(ids(plan).length, new Set(ids(plan)).size);
  for (const id of ['tuition', 'income', 'criminalRecord', 'residenceProviderID']) assert.ok(!ids(plan).includes(id));
  for (const document of plan.documents) {
    assert.ok(document.context);
    assert.ok(document.sourceIds.length);
    assert.ok(document.why.ko && document.why.en);
  }
});

test('an empty profile yields an official consultation path, and entered expiry never produces a calculated deadline', () => {
  const empty = buildPlan(blankProfile());
  assert.ok(empty.tasks.length > 0);
  assert.ok(ids(empty).includes('consultationChecklist'));
  const p = profile({ events: ['extension'], expiry: '', answers: { housing: 'lease' } });
  assert.ok(questionIds(p).includes('expiry'));
  assert.ok(!questionIds({ ...p, answers: { ...p.answers, expiry: '2026-11-05' } }).includes('expiry'));
  const firstDate = buildPlan({ ...p, expiry: '2026-11-05' });
  const secondDate = buildPlan({ ...p, expiry: '2026-12-20' });
  assert.deepEqual(firstDate, secondDate, 'dates are inputs for official verification, not automatic legal calculations');
});
