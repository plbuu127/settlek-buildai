"use client";
import {useApp} from '../state';
import {residenceGuides} from '../../data/residence-guides';
import {sources} from '../../data/catalog';
export default function ResidenceGuide(){
 const {state}=useApp(),l=state.language,guide=residenceGuides[state.planProfile?.visa||''];
 if(!guide)return null;
 return <section className="panel status-guide"><p className="eyebrow">{l==='ko'?'세부 체류자격별 공식 확인':'OFFICIAL CHECKS FOR YOUR STATUS'}</p><h2>{guide.title[l]}</h2><p>{guide.summary[l]}</p><ul>{guide.steps.map((step,i)=><li key={i}>{step[l]}</li>)}</ul><div className="source-links">{guide.sourceIds.map(id=>{const source=sources.find(s=>s.id===id);return source?<a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.title[l]} ↗</a>:null})}</div><p className="small">{l==='ko'?'공식 자료 확인: 2026-10-26 · 개인의 자격·허가 결과를 판정하지 않습니다.':'Sources reviewed: 2026-10-26 · No individual eligibility or permission decision.'}</p></section>;
}
