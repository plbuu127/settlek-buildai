import {env} from "cloudflare:workers";
import {analyze} from "../../../lib/ai";
import {cleanProfile} from "../../../lib/validation";
export async function POST(request:Request){
 const json=(body:any,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
 if(!request.headers.get("oai-authenticated-user-id"))return json({error:"sign_in_required"},401);
 const origin=request.headers.get("origin");
 if(origin!==new URL(request.url).origin)return json({error:"invalid_origin"},403);
 if(Number(request.headers.get("content-length")||0)>12000)return json({error:"input_too_large"},413);
 try{
 const text=await request.text();if(text.length>12000)return json({error:"input_too_large"},413);
 const body=JSON.parse(text);const profile=cleanProfile(body.profile);
 const result=await analyze(profile,body.consent===true,env);
 return json(result);
 }catch(e){const code=e instanceof Error?e.message:"unknown";
 const known=["not_configured","storage_unavailable","consent_required","budget_or_busy","provider_busy","provider_unavailable","incomplete_result","invalid_result","invalid_input","invalid_date","sensitive_input"];
 return json({error:known.includes(code)?code:"analysis_unavailable"},["invalid_input","invalid_date","sensitive_input","consent_required"].includes(code)?400:503);}
}
