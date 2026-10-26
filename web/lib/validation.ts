import {residenceChoices} from "../data/residence-guides.ts";
import type { Profile } from "./planner.ts";
export function validDate(s:unknown):boolean {
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
 const d=new Date(s+"T00:00:00Z");return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s&&Number(s.slice(0,4))>=1900&&Number(s.slice(0,4))<=2200;
}
export function hasSensitiveText(s:string):boolean {
 return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b\d{6}[- ]?[1-8]\d{6}\b|\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b|\b(?:sk-|nvapi-)[A-Za-z0-9_-]{12,}/i.test(s);
}
const fields=["housing","employment","study","integration","expiry","moveDate","addressReported"];
export function cleanProfile(raw:any):Profile {
 if(!raw||typeof raw!=="object")throw new Error("invalid_input");
 const take=(key:string,max=100)=>{ if(raw[key]===undefined)return ""; if(typeof raw[key]!=="string"||raw[key].length>max)throw new Error("invalid_input");return raw[key].trim(); };
 const p:Profile={status:take("status",30),visa:take("visa",30),expiry:take("expiry",10),goal:take("goal",30),city:take("city",30),events:[],answers:{},note:take("note",1200)};
 if(!["unknown","student","worker","jobseeker","resident","visitor"].includes(p.status))throw new Error("invalid_input");
 if(!residenceChoices.some(([code])=>code===p.visa))throw new Error("invalid_input");
 if(!["work","study","stay","integration"].includes(p.goal))throw new Error("invalid_input");
 if(!["","서울","경기","부산","대전","기타"].includes(p.city))throw new Error("invalid_input");
 if(p.expiry&&!validDate(p.expiry))throw new Error("invalid_date");
 if(hasSensitiveText(p.note))throw new Error("sensitive_input");
 const ev=["moved","employed","searching","graduation","integration","extension","education"];
 p.events=Array.isArray(raw.events)?[...new Set<string>(raw.events.filter((x:any)=>ev.includes(x)))]:[];
 for(const k of fields)if(typeof raw.answers?.[k]==="string"){
   const v=raw.answers[k];
   if(v.length>100)throw new Error("invalid_input");
   if(k==="addressReported"&&! ["yes","no","unknown"].includes(v))throw new Error("invalid_input");
   if(Object.hasOwn(factValues,k)&&!factValues[k].includes(v))throw new Error("invalid_input");
   if(["expiry","moveDate"].includes(k)&&v!=="unknown"&&!validDate(v))throw new Error("invalid_date");
   p.answers[k]=v;
 }
 return p;
}
export const factValues:Record<string,string[]>={
 housing:["lease","provided","unknown"],employment:["offer","searching","working","unknown"],
 study:["enrolled","admitted","graduated","unknown"],integration:["interested","registered","completed","unknown"]
};
