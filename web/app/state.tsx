"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import type {HistoryEntry,Reminder} from "../lib/records";
import {blankProfile,type Profile,type Plan,type Prep} from "../lib/planner";
export type Analysis={summary:{ko:string;en:string};facts:{field:string;value:string;evidence:string}[];meta:{mode:string;provider?:string;model?:string;requestId?:string;at:string;tokens?:number;durationMs?:number;remaining?:number}};
export type State={profile:Profile;planProfile:Profile|null;comparisonProfile:Profile|null;history:HistoryEntry[];reminders:Reminder[];plan:Plan|null;analysis:Analysis|null;prep:Record<string,Prep>;done:string[];language:"ko"|"en";rememberNote:boolean};
export const initial=():State=>({planProfile:null,comparisonProfile:null,history:[],reminders:[],profile:{...blankProfile(),status:"unknown",visa:"unknown",goal:"stay"},plan:null,analysis:null,prep:{},done:[],language:"ko",rememberNote:false});
const Context=createContext<{state:State;setState:(s:State|((s:State)=>State))=>void;ready:boolean;saved:boolean;pending:Analysis|null;setPending:(a:Analysis|null)=>void}>({state:initial(),setState:()=>{},ready:false,saved:false,pending:null,setPending:()=>{}});
export function AppProvider({children}:{children:ReactNode}){
 useEffect(()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})},[]);
 const [pending,setPending]=useState<Analysis|null>(null);
 const [state,setState]=useState<State>(initial),[ready,setReady]=useState(false),[saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem("settlek-buildai-v1")||"null");if(raw?.version===1&&raw.state?.profile){setState({...initial(),...raw.state,profile:{...blankProfile(),...raw.state.profile}})}}catch{}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;document.documentElement.lang=state.language;try{const safe={...state,comparisonProfile:state.comparisonProfile?{...state.comparisonProfile,note:""}:null,planProfile:state.planProfile?{...state.planProfile,note:""}:null,profile:{...state.profile,note:state.rememberNote?state.profile.note:""},analysis:state.analysis?{...state.analysis,facts:state.rememberNote?state.analysis.facts:state.analysis.facts.map(f=>({...f,evidence:""}))}:null};localStorage.setItem("settlek-buildai-v1",JSON.stringify({version:1,state:safe}));setSaved(true)}catch{setSaved(false)}},[state,ready]);
 return <Context.Provider value={{state,setState,ready,saved,pending,setPending}}>{children}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
