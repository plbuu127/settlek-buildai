import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,buildPlan,reconcilePreparation,type Profile} from '../lib/planner.ts';
import {comparisonBaseline,comparePlans} from '../lib/plan-changes.ts';
import {residenceChoices,residenceGuides,sourceMatchesProfile} from '../data/residence-guides.ts';
import {sources} from '../data/catalog.ts';
import {cleanProfile} from '../lib/validation.ts';
import {sanitizeRecord} from '../lib/records.ts';

const profile=(patch:Partial<Profile>={}):Profile=>({...blankProfile(),status:'worker',visa:'E-7-1',goal:'work',city:'서울',events:['moved','employed'],answers:{housing:'lease',employment:'offer',addressReported:'no'},...patch});
const ids=(items:{id:string}[])=>items.map(d=>d.id);

test('housing comparison shows the substitution and preserves unrelated ready state',()=>{
 const before=profile(),after=profile({answers:{...before.answers,housing:'provided'}});
 const old=buildPlan(before),next=buildPlan(after),diff=comparePlans(before,after)!;
 assert.deepEqual(ids(diff.added),['accommodation']);
 assert.deepEqual(ids(diff.removed),['lease']);
 assert.deepEqual(diff.recheck,[]);
 const card=old.documents.find(d=>d.id==='residenceCard')!;
 const prep=reconcilePreparation({residenceCard:{state:'done',held:true,reuse:true,context:card.context}},next);
 assert.ok(ids(diff.kept).includes('residenceCard'));
 assert.equal(prep.residenceCard.state,'done');
 assert.equal(prep.residenceCard.reuse,true);
 assert.equal(prep.accommodation.state,'todo');
});

test('a changed region requests a new check rather than claiming the document was removed',()=>{
 const diff=comparePlans(profile(),profile({city:'부산'}))!;
 assert.deepEqual(ids(diff.recheck),['lease']);
 assert.deepEqual(diff.added,[]);
 assert.deepEqual(diff.removed,[]);
});

test('first plan and explicit example reset never claim a previous user plan',()=>{
 const p=profile(),plan=buildPlan(p);
 assert.equal(comparePlans(null,p),null);
 assert.equal(comparisonBaseline(null,null,null,plan),null);
 assert.equal(comparisonBaseline(plan,p,p,plan,true),null);
});

test('comparison keeps the last completed plan across additional questions without retaining notes',()=>{
 const p=profile({note:'Temporary personal narrative'}),first=buildPlan(p);
 const pending=profile({answers:{employment:'offer'}}),incomplete=buildPlan(pending);
 assert.ok(incomplete.questions.length);
 const baseline=comparisonBaseline(first,p,null,incomplete)!;
 assert.equal(baseline.note,'');
 assert.notEqual(baseline.answers,p.answers);
 const next=profile({answers:{housing:'provided',employment:'offer',addressReported:'no'}});
 assert.deepEqual(comparisonBaseline(incomplete,pending,baseline,buildPlan(next)),baseline);
 assert.deepEqual(comparisonBaseline(buildPlan(next),next,baseline,buildPlan(next)),baseline);
});

test('a later meaningful update compares with the immediately preceding completed plan',()=>{
 const first=profile(),second=profile({city:'부산'}),third=profile({city:'대전'});
 assert.deepEqual(comparisonBaseline(buildPlan(second),second,first,buildPlan(third)),second);
});

test('all selectable residence codes survive validation and account snapshots',()=>{
 for(const [visa] of residenceChoices){
  const p=profile({visa});
  assert.equal(cleanProfile(p).visa,visa);
  const saved=sanitizeRecord({profile:p,prep:{},done:[],reminders:[],history:[],language:'en'});
  assert.equal(saved.profile.visa,visa);
 }
 assert.throws(()=>cleanProfile(profile({visa:'made-up-status'})));
});

test('F-2 and F-6 work plans require checking their own conditions without generic E employer documents',()=>{
 for(const visa of ['F-2','F-6']) for(const employment of ['offer','working','searching']){
  const p=profile({visa,answers:{housing:'lease',employment,addressReported:'no'}}),plan=buildPlan(p);
  for(const id of ['employmentContract','employerRegistration','employmentProof','jobSearchPlan'])assert.ok(!ids(plan.documents).includes(id));
  assert.ok(plan.tasks.find(t=>t.id==='work')?.sourceIds.includes('residence-employment-law'));
  assert.ok(ids(plan.documents).includes('consultationChecklist'));
 }
 assert.ok(ids(buildPlan(profile()).documents).includes('employmentContract'));
});

test('status-specific sources are traceable and do not appear for an unrelated status',()=>{
 for(const guide of Object.values(residenceGuides))for(const id of guide.sourceIds)assert.ok(sources.some(s=>s.id===id),id);
 const e7=sources.find(s=>s.id==='e7-4-update')!;
 assert.equal(sourceMatchesProfile(e7,profile({visa:'E-7-4'})),true);
 assert.equal(sourceMatchesProfile(e7,profile({visa:'F-6'})),false);
 const d10=sources.find(s=>s.id==='d10-1-reference')!;
 assert.match(d10.scope.en,/overseas/);
 assert.match(d10.scope.en,/not a required-document checklist/);
 const saved=sanitizeRecord({profile:profile({visa:'D-10-1'}),prep:{},done:[],language:'en',reminders:[{id:'r1',title:'Check official instructions',date:'2026-11-01',kind:'personal',source:d10.url,leadDays:0,done:false}]});
 assert.equal(saved.reminders[0].source,d10.url);
});
