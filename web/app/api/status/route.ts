import {env} from "cloudflare:workers";
import {MODEL,MAX_REQUESTS} from "../../../lib/ai";
export async function GET(request:Request){
 let used=0,storageReady=false;
 try{if(env.DB){const row=await env.DB.prepare("SELECT used FROM ai_budget WHERE id='shared'").first<{used:number}>();used=row?.used||0;storageReady=true;}}catch{}
 const local=["localhost","127.0.0.1"].includes(new URL(request.url).hostname);
 return Response.json({configured:!!env.NEBIUS_API_KEY&&env.NEBIUS_AI_ENABLED==="true",storageReady,
 signedIn:!!request.headers.get("oai-authenticated-user-id"),local,model:MODEL,remaining:Math.max(0,MAX_REQUESTS-used)},{headers:{"Cache-Control":"no-store"}});
}
