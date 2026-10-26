"use client";
import {useEffect,useState} from "react";
import Link from "./link";
import {useApp,initial,type State} from "../state";
import {carryTasks} from "../../lib/preparation";
import {buildPlan} from "../../lib/planner";
import {documentCatalog} from "../../data/catalog";
import type {SavedRecord} from "../../lib/records";
function snapshot(state:State):SavedRecord{return {profile:{...state.profile,note:""},prep:state.prep,done:carryTasks(state.done,state.planProfile,state.profile,buildPlan(state.profile)),reminders:state.reminders,history:state.history,language:state.language};}
export function downloadBackup(state:State){
 const blob=new Blob([JSON.stringify({format:"settlek-records",version:1,createdAt:new Date().toISOString(),record:snapshot(state)},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SettleK-records-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function AccountControls({compact=false}:{compact?:boolean}){
 const {state,setState,setPending}=useApp(),tr=(ko:string,en:string)=>state.language==="ko"?ko:en;
 const [status,setStatus]=useState<any>(null),[cloud,setCloud]=useState<any>(null),[checked,setChecked]=useState(false),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(false);
 useEffect(()=>setMessage(""),[state.language]);
 const say=(ko:string,en:string,isError=false)=>{setMessage(tr(ko,en));setError(isError)};
 async function refresh(){
  try{const response=await fetch("/api/records",{cache:"no-store"});const result:any=await response.json();
  if(response.status===401){setChecked(false);return null}if(!response.ok)throw new Error(result.error||"storage");
  setCloud(result.record);setChecked(true);return result.record;
  }catch{setChecked(false);say("계정의 저장 상태를 확인하지 못했어요. 다시 확인해 주세요.","Could not check account storage. Please check again.",true);return null}
 }
 useEffect(()=>{fetch("/api/status",{cache:"no-store"}).then(r=>r.json()).then((s:any)=>{setStatus(s);if(s.signedIn)refresh()}).catch(()=>say("로그인 상태를 확인하지 못했어요.","Could not check sign-in status.",true))},[]);
 async function save(){
  if(!consent||!checked)return;
  if(cloud&&!window.confirm(tr("계정의 이전 저장본을 현재 준비 상태로 업데이트합니다. 계속할까요?","Update the previous account snapshot with your current preparation?")))return;
  setBusy(true);
  try{const r=await fetch("/api/records",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({expectedVersion:cloud?.version||0,record:snapshot(state)})});const data:any=await r.json();
  if(r.status===409){say("다른 화면에서 계정 기록이 바뀌었어요. 저장 상태를 다시 확인한 뒤 선택해 주세요.","The account record changed elsewhere. Refresh its status before choosing what to save.",true);setChecked(false);return}
  if(!r.ok)throw new Error("save");
  setCloud(data.record);setConsent(false);say("현재 준비 상태를 내 계정에 저장했어요.","Your preparation is saved to your account.");
  }catch{say("계정에 저장하지 못했어요. 현재 기기의 내용은 유지됩니다.","Could not save to your account. Your local data is preserved.",true)}finally{setBusy(false)}
 }
 async function load(){
  setBusy(true);
  const record=await refresh();
  try{if(!record){say("불러올 계정 기록이 없어요.","There is no account record to load.");return}
  if(!window.confirm(tr("현재 기기의 상황·준비 상태·일정을 계정 저장본으로 바꿉니다. 필요한 경우 먼저 백업을 내려받으세요. 불러올까요?","Replace this device’s situation, preparation and reminders with the account snapshot? Download a backup first if needed.")))return;
  const data=record.state;const profile={...data.profile,note:""};const plan=buildPlan(profile);
  setPending(null);
  setState(s=>({...s,...data,profile,planProfile:profile,comparisonProfile:null,plan,analysis:null,rememberNote:false,history:data.history||[],reminders:data.reminders||[]}));
  say("계정 기록을 불러왔어요. 메모 원문은 저장 대상에 포함되지 않습니다.","Account record loaded. Original notes are not included.");
  }finally{setBusy(false)}
 }
 async function remove(){
  if(!cloud||!window.confirm(tr("내 계정의 저장본을 삭제할까요? 이 브라우저의 기록은 남습니다. 계정 삭제는 되돌릴 수 없습니다.","Delete your account snapshot? This browser’s records remain. Account deletion cannot be undone.")))return;
  setBusy(true);
  try{const r=await fetch("/api/records",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({expectedVersion:cloud.version,confirm:true})});
  if(!r.ok){setChecked(false);throw new Error("delete")}setCloud(null);say("계정 저장본을 삭제했어요.","Your account snapshot was deleted.");
  }catch{say("삭제하지 못했어요. 저장 상태를 다시 확인해 주세요.","Could not delete. Please refresh the storage status.",true)}finally{setBusy(false)}
 }
 return <section className="panel account-panel"><div className="section-title"><h2>{tr("다음 기기에서도 이어가려면","Continue on another device")}</h2><span className="badge">{status?.local?tr("개발용 계정","Development identity"):tr("계정 저장","Account storage")}</span></div><p>{tr("상황·확인 답변·서류 종류와 준비 상태·일정을 저장합니다. 메모 원문·신분증 번호·서류 원본·AI 응답 원문은 계정에 보내지 않습니다.","Save your situation, answers, document types, preparation and reminders. Original notes, ID numbers, document files and raw AI responses are not sent to account storage.")}</p>
 {!status?<p className="small">{tr("로그인 상태 확인 중…","Checking sign-in…")}</p>:!status.signedIn?<a className="button primary" target="_top" href={"/signin-with-chatgpt?return_to="+(compact?"/documents":"/records")}>{tr("로그인하고 계정에 저장","Sign in to save your records")}</a>:<>
 <div className="cloud-status"><strong>{checked?(cloud?tr("계정 저장본 있음","Account snapshot available"):tr("아직 계정 저장본이 없어요","No account snapshot yet")):tr("계정 상태 확인 필요","Account status needs checking")}</strong>{cloud&&<small>{tr("마지막 저장","Last saved")}: {cloud.updatedAt} · v{cloud.version}</small>}<button className="text-button" disabled={busy} onClick={refresh}>{tr("저장 상태 다시 확인","Refresh storage status")}</button></div>
 <label className="check cloud-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{tr("위의 준비 기록을 현재 로그인한 계정에 저장하는 데 동의합니다.","I agree to save the preparation records described above to the signed-in account.")}</label>
 <div className="actions"><button className="button primary" disabled={busy||!consent||!checked} onClick={save}>{busy?tr("처리 중…","Working…"):tr("내 계정에 저장","Save to my account")}</button><button className="button secondary" disabled={busy||!cloud} onClick={load}>{tr("계정 기록 불러오기","Load account record")}</button><button className="small-button" onClick={()=>downloadBackup(state)}>{tr("백업 다운로드","Download backup")}</button></div>
 {!compact&&<details className="disclosure danger-zone"><summary>{tr("계정 저장본 삭제","Delete account snapshot")}</summary><p className="small">{tr("이 기기의 데이터와 계정 저장본은 별도입니다.","Device data and the account snapshot are separate.")}</p><button className="small-button" disabled={busy||!cloud} onClick={remove}>{tr("계정 저장본 삭제","Delete account snapshot")}</button></details>}
 </>}
 {message&&<p className={"notice "+(error?"error":"")} role="status">{message}</p>}
 {status?.local&&<p className="small">{tr("이 화면의 로그인은 로컬 개발용 계정입니다. 배포된 앱의 실제 계정 로그인과는 별도로 검증합니다.","This preview uses a local development identity. Hosted account sign-in is verified separately.")}</p>}
 </section>
}
export default function Records(){
 const {state,setState,saved,setPending}=useApp(),l=state.language,tr=(ko:string,en:string)=>l==="ko"?ko:en;
 const proc:Record<string,[string,string]>={address:["체류지 신고 확인","Address reporting"],extension:["체류 연장 준비","Stay extension"],work:["취업 절차 확인","Work procedure"],education:["학업 준비","Study preparation"],integration:["사회통합 참여","Integration"],"stay-check":["체류·등록증 확인","Residence/card check"],"check-route":["다음 절차 확인","Next procedure"]};
 const action:Record<string,[string,string]>={held:["보유 기록","Recorded as held"],unheld:["보유 표시 해제","Ownership removed"],ready:["준비 완료","Preparation ready"],reused:["재사용 확인","Reuse confirmed"],done:["확인·준비 완료","Task completed"],undo:["완료·확인 되돌림","Completion/check undone"]};
 function clear(){if(!window.confirm(tr("이 브라우저의 상황·메모·계획·준비·일정 기록을 지울까요? 계정 저장본은 유지됩니다.","Clear this browser’s situation, notes, plan, preparation and reminders? Your account snapshot remains.")))return;setPending(null);setState({...initial(),language:l})}
 return <section><div className="screen-heading"><div><p className="eyebrow">MY SETTLEMENT RECORDS</p><h1>{tr("나의 정착 기록","My settlement records.")}</h1><p className="intro">{tr("이미 준비한 것을 기억하고, 다음 변화를 이어서 준비하세요.","Keep what you have prepared and continue through your next change.")}</p></div><Link className="small-button" href="/planner">{tr("내 상황 수정","Edit situation")} ↗</Link></div>
 <div className="record-stats"><div><strong>{Object.values(state.prep).filter(p=>p.held).length}</strong><span>{tr("현재 목록의 보유 서류","Held documents in this plan")}</span></div><div><strong>{state.done.length}</strong><span>{tr("완료한 준비","Completed tasks")}</span></div><div><strong>{state.history.length}</strong><span>{tr("준비 기록","History entries")}</span></div></div>
 <div className="device-status"><b>{saved?tr("이 브라우저에 저장됨","Saved in this browser"):tr("브라우저 저장 확인 필요","Device storage needs checking")}</b><span>{tr("공용 기기에서는 사용 후 기기 기록을 지워주세요.","On a shared device, clear local records after use.")}</span></div>
 <AccountControls/>
 <section className="panel"><div className="section-title"><h2>{tr("보유·완료 기록","Ownership and preparation history")}</h2><span className="small">{tr("최근 100개","Latest 100 entries")}</span></div><p className="small">{tr("이전 준비의 완료 기록은 남습니다. 상황이 바뀐 새 신청의 완료·재사용 확인으로 자동 적용하지 않습니다.","Past preparation remains in your history. It does not automatically complete a new application or confirm reuse when conditions change.")}</p>
 {state.history.length?<ol className="history-list">{[...state.history].reverse().map(e=><li key={e.id}><div><strong>{e.kind==="document"?documentCatalog[e.itemId]?.title[l]||e.itemId:proc[e.itemId]?.[l==="ko"?0:1]||e.itemId}</strong><span>{action[e.action]?.[l==="ko"?0:1]||e.action}</span></div><time dateTime={e.at}>{new Date(e.at).toLocaleString(l==="ko"?"ko-KR":"en-GB")}</time></li>)}</ol>:<p>{tr("서류 보유나 완료 상태를 표시하면 기록이 쌓여요.","Mark a document as held or complete a task to start your history.")}</p>}</section>
 <details className="disclosure"><summary>{tr("이 기기의 기록 관리","Manage this device’s records")}</summary><div className="actions"><button className="small-button" onClick={()=>downloadBackup(state)}>{tr("백업 다운로드 (메모 원문 제외)","Download backup (notes excluded)")}</button><button className="small-button" onClick={clear}>{tr("이 브라우저 기록 지우기","Clear this browser’s records")}</button></div></details>
 </section>
}

