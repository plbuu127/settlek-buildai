import test from "node:test";
import assert from "node:assert/strict";
import {blankProfile,buildPlan} from "../lib/planner.ts";
import {carryTasks,carryPreparation,taskContext,contextHash} from "../lib/preparation.ts";
import type {HistoryEntry} from "../lib/records.ts";
test("changed housing preserves unrelated work completion but reopens address preparation",()=>{
 const old={...blankProfile(),status:"worker",visa:"E",goal:"work",city:"서울",events:["moved"],answers:{housing:"lease",employment:"working",addressReported:"no"}};
 const next={...old,answers:{...old.answers,housing:"provided"}};
 assert.deepEqual(carryTasks(["address","work"],old,next,buildPlan(next)),["work"]);
});
test("new expiry requires a fresh extension check, even if the task ID is unchanged",()=>{
 const old={...blankProfile(),status:"resident",visa:"F",goal:"stay",expiry:"2027-01-01",answers:{housing:"lease"}};
 const next={...old,expiry:"2028-01-01"};
 assert.notEqual(taskContext(old,"extension"),taskContext(next,"extension"));
 assert.deepEqual(carryTasks(["extension"],old,next,buildPlan(next)),[]);
});
test("historical ownership carries to a new list without restoring reuse or completion",()=>{
 const p={...blankProfile(),status:"worker",visa:"E",goal:"work",answers:{housing:"lease",employment:"working"}};
 const history:HistoryEntry[]=[{id:"history-1",kind:"document",itemId:"lease",action:"held",at:"2026-10-26T00:00:00.000Z",context:contextHash("old")}];
 const prep=carryPreparation({},buildPlan(p),history);
 assert.equal(prep.lease.held,true);assert.equal(prep.lease.reuse,false);assert.equal(prep.lease.state,"todo");
 history.push({...history[0],id:"history-2",action:"unheld"});
 assert.equal(carryPreparation({},buildPlan(p),history).lease.held,false);
});
