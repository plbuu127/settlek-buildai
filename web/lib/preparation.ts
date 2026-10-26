import {buildPlan,reconcilePreparation,type Profile,type Prep,type Plan} from "./planner.ts";
import type {HistoryEntry} from "./records.ts";
export function contextHash(value:unknown):string{const s=JSON.stringify(value);let hash=2166136261;for(const ch of s)hash=Math.imul(hash^ch.charCodeAt(0),16777619);return (hash>>>0).toString(36);}
export function taskContext(p:Profile,id:string):string{
 const a=p.answers;
 const parts:Record<string,unknown>={address:[p.visa,p.city,p.events.includes("moved"),a.addressReported,a.moveDate,a.housing],work:[p.visa,p.status,a.employment,p.events.includes("employed"),p.events.includes("searching")],extension:[p.visa,p.expiry,a.expiry],education:[p.visa,p.status,a.study,p.events.includes("graduation")],integration:[p.visa,a.integration],"stay-check":[p.visa,p.expiry]};
 return contextHash(parts[id]??[p.visa,p.goal]);
}
export function carryTasks(done:string[],previous:Profile|null,next:Profile,plan:Plan):string[]{return previous?done.filter(id=>plan.tasks.some(t=>t.id===id)&&taskContext(previous,id)===taskContext(next,id)):[];}
export function carryPreparation(prep:Record<string,Prep>,plan:Plan,history:HistoryEntry[]):Record<string,Prep>{
 const next=reconcilePreparation(prep,plan);
 for(const d of plan.documents){if(prep[d.id])continue;let held=false;for(const e of history){if(e.kind!=="document"||e.itemId!==d.id)continue;if(e.action==="held"||e.action==="reused")held=true;if(e.action==="unheld")held=false;}next[d.id].held=held;}
 return next;
}
export function appendHistory(history:HistoryEntry[],event:Omit<HistoryEntry,"id"|"at">):HistoryEntry[]{return [...history,{...event,id:crypto.randomUUID(),at:new Date().toISOString()}].slice(-100);}
