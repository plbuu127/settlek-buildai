"use client";
import {useState} from "react";
import Link from "./link";
import {useApp} from "../state";
import {sources} from "../../data/catalog";
import {appendHistory,contextHash} from "../../lib/preparation";
import {AccountControls} from "./records";
export default function Documents(){
 const {state,setState,saved}=useApp();const l=state.language,tr=(ko:string,en:string)=>l==="ko"?ko:en;
 const [missing,setMissing]=useState(false),[copied,setCopied]=useState("");
 if(!state.plan)return <div className="empty-card"><h1>{tr("먼저 내 상황을 알려주세요.","Start with your situation.")}</h1><p>{tr("계획에서 연결한 서류를 여기서 함께 준비할 수 있어요.","Prepare the documents from your plan here.")}</p><Link href="/planner" className="button primary">{tr("상황 입력","My situation")}</Link></div>;
 const docs=state.plan.documents;
 const ready=docs.filter(d=>state.prep[d.id]?.state==="done").length;
 function change(id:string,patch:any,action?:"held"|"unheld"|"reused"|"ready"|"undo"){
  const doc=docs.find(d=>d.id===id)!;
  setState(s=>({...s,prep:{...s.prep,[id]:{...s.prep[id],...patch,context:doc.context}},history:action?appendHistory(s.history,{kind:"document",itemId:id,action,context:contextHash(doc.context)}):s.history}));
 }
 async function copy(id:string,text:string){try{await navigator.clipboard.writeText(text);setCopied(id)}catch{setCopied("error")}}
 return <section><div className="screen-heading"><div><p className="eyebrow">MY DOCUMENTS</p><h1>{tr("무엇을 준비하면 될까요?","What should I prepare?")}</h1><p className="intro">{tr("전체 목록에서 여러 서류를 함께 준비하세요. 필요한 이유와 받는 곳은 항목별로 확인할 수 있어요.","Prepare several documents together. Each item explains why it applies and where to start.")}</p></div><Link className="small-button" href="/plan">{tr("나의 계획","My plan")} ↗</Link></div>
 <div className="document-toolbar"><div><strong>{ready}/{docs.length} {tr("준비 완료","ready")}</strong><p className="small">{saved?tr("현재 상태가 이 브라우저에 저장됐어요.","Your progress is saved in this browser."):tr("브라우저 저장을 확인해 주세요.","Please check browser storage.")}</p></div><label className="check"><input type="checkbox" checked={missing} onChange={e=>setMissing(e.target.checked)}/>{tr("미완료만 보기","Show unfinished only")}</label><button className="small-button" onClick={()=>window.print()}>{tr("목록 인쇄","Print list")}</button></div>
 <div className="notice">{tr("‘보유’와 ‘이번 신청에 재사용 가능’은 다른 확인입니다. 유효기간·내용·제출처 조건을 직접 확인한 뒤 표시하세요. 준비 완료는 기관 승인 완료를 뜻하지 않습니다.","Owning a document and confirming it can be reused are different. Check validity, content and destination requirements yourself. Preparation is not official approval.")}</div>
 {docs.filter(d=>!missing||state.prep[d.id]?.state!=="done").map(d=>{const p=state.prep[d.id]||{state:"todo",held:false,reuse:false,context:d.context};return <article key={d.id} className={"document-card "+(p.state==="done"?"ready":"")}>
 <div className="document-top"><div><span className={"badge "+(d.classification==="check"?"sample":"")}>{d.classification==="official"?tr("공식 안내 항목","In official guidance"):d.classification==="conditional"?tr("조건에 따라 확인","Check applicability"):tr("공식 확인 먼저","Confirm first")}</span><h2>{d.title[l]}</h2></div><label>{tr("준비 상태","Preparation status")}<select aria-label={d.title[l]+" · "+tr("준비 상태","Preparation status")} value={p.state} onChange={e=>change(d.id,{state:e.target.value},e.target.value==="done"?"ready":p.state==="done"?"undo":undefined)}><option value="todo">{tr("준비 전","Not started")}</option><option value="doing">{tr("준비 중","In progress")}</option><option value="done">{tr("준비 완료","Ready")}</option></select></label></div>
 <p className="document-why">{d.why[l]}</p>
 <div className="ownership"><label className="check"><input type="checkbox" checked={p.held} onChange={e=>change(d.id,{held:e.target.checked,reuse:e.target.checked?p.reuse:false,checkedAt:new Date().toISOString()},e.target.checked?"held":"unheld")}/>{tr("이미 보유하고 있어요","I already have this document")}</label><label className="check"><input type="checkbox" checked={p.reuse} disabled={!p.held} onChange={e=>change(d.id,{reuse:e.target.checked,checkedAt:new Date().toISOString()},e.target.checked?"reused":"undo")}/>{tr("이번 신청에 재사용할 수 있는지 직접 확인했어요","I checked that I can reuse it for this application")}</label></div>
 <details className="document-guide"><summary>{tr("준비 방법 · 공식 근거","How to prepare · Official sources")}</summary><div className="issuer"><small>{tr("받는 곳·확인할 곳","WHERE TO GET OR CHECK IT")}</small><strong>{d.where[l]}</strong></div><ol>{d.steps.map((step,i)=><li key={i}>{step[l]}</li>)}</ol>
 {d.request&&<div className="request-note"><p className="small">{tr("직접 보낼 수 있는 요청문","A message you can send yourself")}</p><blockquote>{d.request[l]}</blockquote><button className="small-button" onClick={()=>copy(d.id,d.request![l])}>{copied===d.id?tr("복사했어요","Copied"):tr("요청문 복사","Copy request")}</button></div>}
 <div className="source-links">{d.sourceIds.map(id=>{const source=sources.find(x=>x.id===id);return source?<a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.title[l]} ↗</a>:null})}</div></details></article>})}
 {missing&&ready===docs.length&&<p className="success">{tr("현재 목록의 준비를 모두 표시했어요.","Every item in this list is marked ready.")}</p>}
 <div aria-live="polite">{copied==="error"&&<p className="notice">{tr("복사하지 못했어요. 요청문을 선택해 직접 복사해 주세요.","Could not copy. Select the request text and copy it manually.")}</p>}</div>
 <AccountControls compact/>
 </section>
}
