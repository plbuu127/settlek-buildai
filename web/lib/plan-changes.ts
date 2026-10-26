import {buildPlan,type Plan,type Profile,type Document} from './planner.ts';

export function comparisonBaseline(current:Plan|null,currentProfile:Profile|null,baseline:Profile|null,next:Plan,reset=false):Profile|null{
 if(reset)return null;
 // Keep the completed plan while its replacement is still asking questions.
 const candidate=current&&currentProfile&&current.questions.length===0&&current.fingerprint!==next.fingerprint?currentProfile:baseline;
 return candidate?{...candidate,events:[...candidate.events],answers:{...candidate.answers},note:''}:null;
}
export function comparePlans(previous:Profile|null,current:Profile):{added:Document[];removed:Document[];recheck:Document[];kept:Document[]}|null{
 if(!previous)return null;
 const before=buildPlan(previous),after=buildPlan(current);
 const old=new Map(before.documents.map(d=>[d.id,d]));
 const next=new Map(after.documents.map(d=>[d.id,d]));
 return {
  added:after.documents.filter(d=>!old.has(d.id)),
  removed:before.documents.filter(d=>!next.has(d.id)),
  recheck:after.documents.filter(d=>old.has(d.id)&&old.get(d.id)!.context!==d.context),
  kept:after.documents.filter(d=>old.get(d.id)?.context===d.context),
 };
}
