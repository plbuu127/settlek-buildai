"use client";
import {useApp} from '../state';
import {comparePlans} from '../../lib/plan-changes';

const fields=[['housing','거주 형태','Housing'],['employment','취업 상황','Employment'],['study','학업 상황','Study'],['integration','사회통합','Integration'],['addressReported','체류지 신고','Address report']] as const;
const values:Record<string,[string,string]>={lease:['내 명의 임대차 계약','Lease in my name'],provided:['제공받는 숙소','Provided housing'],offer:['새 채용 제안','New job offer'],working:['근무 중','Currently working'],searching:['구직 중','Looking for work'],enrolled:['재학 중','Enrolled'],admitted:['입학 예정','Admitted'],graduated:['졸업','Graduated'],interested:['참여 검토','Exploring'],registered:['참여 중','Participating'],completed:['이수','Completed'],yes:['신고함','Reported'],no:['신고 전','Not reported'],unknown:['모름','Not sure']};
export default function PlanChanges(){
 const {state}=useApp(),{comparisonProfile:before,planProfile:after,plan}=state,l=state.language;
 const tr=(ko:string,en:string)=>l==='ko'?ko:en;
 if(!before||!after||!plan||plan.questions.length)return null;
 const diff=comparePlans(before,after)!;
 const label=(value:string|undefined)=>value?(values[value]?.[l==='ko'?0:1]||value):tr('미확인','Not answered');
 const changes=fields.filter(([key])=>before.answers[key]!==after.answers[key]).map(([key,ko,en])=>({name:tr(ko,en),from:label(before.answers[key]),to:label(after.answers[key])}));
 if(before.visa!==after.visa)changes.unshift({name:tr('체류자격','Residence status'),from:before.visa,to:after.visa});
 if(!diff.added.length&&!diff.removed.length&&!diff.recheck.length&&!changes.length)return null;
 const sections=[{id:'added',name:tr('추가된 서류','Added documents'),items:diff.added},{id:'removed',name:tr('이번 목록에서 제외','Removed from this list'),items:diff.removed},{id:'recheck',name:tr('다시 확인할 서류','Recheck documents'),items:diff.recheck}];
 return <section className="plan-changes panel" aria-labelledby="plan-changes-title">
  <p className="eyebrow">{tr('상황이 바뀌면, 준비도 달라집니다','WHEN LIFE CHANGES, YOUR PLAN CHANGES')}</p>
  <h2 id="plan-changes-title">{tr('이전 계획과 달라진 점','What changed in your plan')}</h2>
  <p className="small">{tr('직전 완료한 계획과 현재 계획을 비교합니다. 새로고침해도 이 기기에서 비교를 이어볼 수 있어요.','Compare your previous completed plan with your current plan. This comparison stays on this device after refresh.')}</p>
  {!!changes.length&&<ul className="changed-answers">{changes.map(c=><li key={c.name}><strong>{c.name}</strong><span>{c.from}</span><b aria-label={tr('변경 후','changed to')}>→</b><span>{c.to}</span></li>)}</ul>}
  <div className="change-columns">{sections.map(group=><div className={'change-column '+group.id} key={group.id}><h3>{group.name} <span>{group.items.length}</span></h3>{group.items.length?<ul>{group.items.map(d=><li key={d.id}><strong>{d.title[l]}</strong><p>{group.id==='removed'?tr('바뀐 답변에 따라 이번 준비 후보에서 빠졌어요. 과거의 보유·완료 이력은 나의 기록에 남습니다.','Your updated answers remove this candidate from the current list. Past ownership/completion history remains in My records.'):d.why[l]}</p>{group.id==='recheck'&&<small>{tr('보유 표시는 이어가지만 준비 완료·재사용 여부는 다시 확인해 주세요.','Possession is retained; check preparation and reuse again for the new conditions.')}</small>}</li>)}</ul>:<p className="small">{tr('해당 항목 없음','None')}</p>}</div>)}</div>
  <details className="disclosure"><summary>{tr('그대로 이어가는 서류','Documents carried forward')} ({diff.kept.length})</summary><ul className="kept-documents">{diff.kept.map(d=><li key={d.id}>{d.title[l]} <span className="badge">{state.prep[d.id]?.state==='done'?tr('준비 완료 유지','Ready status kept'):state.prep[d.id]?.state==='doing'?tr('준비 중 유지','In-progress status kept'):tr('현재 준비 상태 유지','Preparation state kept')}</span></li>)}</ul></details>
  <p className="small change-boundary">{tr('목록의 추가·제외는 입력 조건에 따른 준비 후보의 변화입니다. 제출처가 서류 필요 여부를 최종 확인합니다. 비교 기록은 계정 저장본에는 포함하지 않습니다.','These are changes to preparation candidates based on your answers. Confirm final requirements with the receiving office. This comparison is not part of the account snapshot.')}</p>
 </section>;
}
