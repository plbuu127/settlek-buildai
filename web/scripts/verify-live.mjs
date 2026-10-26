import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {buildPlan} from "../lib/planner.ts";
if(!process.argv.includes("--live"))throw new Error("Explicit --live flag required; this uses up to two paid provider requests.");
const base="http://127.0.0.1:4189";
const auth=await fetch(base+"/signin-with-chatgpt?return_to=/planner",{redirect:"manual"});
const cookie=auth.headers.getSetCookie().map(x=>x.split(";")[0]).join("; ");
if(!cookie)throw new Error("Local mock sign-in unavailable");
const cases=[
 {id:"provided-housing-new-offer",profile:{status:"worker",visa:"E",expiry:"2027-03-31",goal:"work",city:"서울",events:["moved","employed"],answers:{addressReported:"no"},note:"My housing is provided by my employer. I have received a new job offer from another company."},expected:{housing:"provided",employment:"offer"},include:["accommodation","employmentContract","employerRegistration"],exclude:["lease","jobSearchPlan"]},
 {id:"own-lease-job-search",profile:{status:"jobseeker",visa:"D-10",expiry:"2027-03-31",goal:"work",city:"서울",events:["moved","searching"],answers:{addressReported:"no"},note:"I rent my home under a lease in my name. I am looking for work and do not have a job offer."},expected:{housing:"lease",employment:"searching"},include:["lease","jobSearchPlan"],exclude:["accommodation","employerRegistration"]}
];
const report={environment:"local-server",identity:"development mock identity, not hosted account authentication",data:"fictional test scenarios only",provider:"Nebius Token Factory",verifiedAt:new Date().toISOString(),cases:[]};
for(const c of cases){
 const response=await fetch(base+"/api/analyze",{method:"POST",headers:{"Content-Type":"application/json","Origin":base,Cookie:cookie},body:JSON.stringify({profile:c.profile,consent:true})});
 const result=await response.json();
 assert.equal(response.status,200,"AI endpoint must succeed: "+(result.error||""));
 assert.equal(result.meta.mode,"live");
 for(const [field,value] of Object.entries(c.expected))assert.ok(result.facts.some(f=>f.field===field&&f.value===value),"Expected extracted "+field+"="+value);
 const profile={...c.profile,answers:{...c.profile.answers,...Object.fromEntries(result.facts.map(f=>[f.field,f.value]))}};
 const plan=buildPlan(profile);const ids=plan.documents.map(d=>d.id);
 for(const id of c.include)assert.ok(ids.includes(id),"Expected document "+id);
 for(const id of c.exclude)assert.ok(!ids.includes(id),"Unexpected document "+id);
 report.cases.push({id:c.id,passed:true,extractedFacts:result.facts.map(({field,value})=>({field,value})),documents:ids,metadata:result.meta});
 console.log(JSON.stringify({case:c.id,passed:true,model:result.meta.model,tokens:result.meta.tokens,durationMs:result.meta.durationMs}));
}
await mkdir(new URL("../../docs/",import.meta.url),{recursive:true});
await writeFile(new URL("../../docs/live-verification.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log("Two real provider scenarios verified; metadata saved without credentials or personal data.");
