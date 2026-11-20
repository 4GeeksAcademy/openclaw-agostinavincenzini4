#!/usr/bin/env node
// Read-only learning catalog queries. Output is allowlisted and contains no auth data/raw bodies.
const rawBase=process.env.BREATHECODE_API_URL||"https://breathecode.herokuapp.com";
let base;
try{const u=new URL(rawBase);if(!/^https?:$/.test(u.protocol)||u.username||u.password)throw Error();base=u.origin;}catch{console.log(JSON.stringify({status:"error",reason:"invalid_base_url"}));process.exit(1);}
const token=process.env.TOKEN_4GEEKS;
function err(e){if(e?.status)return{kind:"http",httpStatus:e.status};const c=e?.cause?.code;return{kind:"request",reason:c==="ENOTFOUND"?"dns":c==="ECONNREFUSED"?"connection_refused":e?.name==="TimeoutError"?"timeout":e instanceof SyntaxError?"invalid_json":e?.name==="TypeError"?"network_or_tls":"request_failed"};}
async function get(path,params={},auth=true){const u=new URL(path,base);for(const[k,v]of Object.entries(params))if(v)u.searchParams.set(k,v);const headers={Accept:"application/json"};if(auth&&token)headers.Authorization=`Token ${token}`;const r=await fetch(u,{method:"GET",headers,signal:AbortSignal.timeout(20000),redirect:"error"});if(!r.ok){await r.body?.cancel();const e=Error("http");e.status=r.status;throw e;}return r.json();}
const rows=d=>Array.isArray(d)?d:Array.isArray(d?.results)?d.results:Array.isArray(d?.data)?d.data:null;
function field(o,ks){for(const k of ks){const v=o?.[k];if(typeof v==="string"||typeof v==="number")return v;}return null;}
function safeAsset(x){const a=x&&typeof x==="object"?x:{};const tech=a.technologies??a.technology;return{slug:field(a,["slug","asset_slug"]),title:field(a,["title","name"]),type:field(a,["asset_type","type"]),difficulty:field(a,["difficulty"]),technologies:Array.isArray(tech)?tech.map(t=>typeof t==="string"?t:field(t,["name","slug"])).filter(Boolean).slice(0,20):typeof tech==="string"?[tech]:[]};}
const out={status:"ok",classification:"catalog entries are general unless program membership is explicitly confirmed",assets:{status:"not_run"},technologies:{status:"not_run"},syllabus:{status:"not_run"}};
const params={asset_type:process.env.ASSET_TYPE||"",technologies:process.env.TECHNOLOGIES||"",difficulty:process.env.DIFFICULTY||"",like:process.argv.slice(2).join(" "),limit:process.env.ASSET_LIMIT||"20"};
try{const d=await get("/v1/registry/asset",params,true);const r=rows(d);if(!r)out.assets={status:"error",reason:"unexpected_response_shape"};else out.assets={status:"ok",count:r.length,items:r.slice(0,100).map(safeAsset)};}catch(e){out.assets={status:"error",...err(e)};}
try{const p={limit:"100"};if(process.env.TECHNOLOGY_QUERY)p.like=process.env.TECHNOLOGY_QUERY;const r=rows(await get("/v1/registry/technology",p,true));out.technologies=r?{status:"ok",count:r.length,items:r.slice(0,100).map(x=>({name:field(x,["name","title"]),slug:field(x,["slug"])}))}:{status:"error",reason:"unexpected_response_shape"};}catch(e){out.technologies={status:"error",...err(e)};}
const detailSlug=process.env.DETAIL_SLUG;
if(detailSlug){try{const d=await get(`/v1/registry/asset/${encodeURIComponent(detailSlug)}`,{},true);out.detail=safeAsset(d?.asset&&typeof d.asset==="object"?d.asset:d);}catch(e){out.detail={status:"error",...err(e)};}}
try{const r=rows(await get("/v1/admissions/public/syllabus",{},false));out.syllabus=r?{status:"ok",count:r.length,items:r.slice(0,30).map(x=>({name:field(x,["name","title"]),slug:field(x,["slug"]),academy:field(x,["academy_name"])}))}:{status:"ok",shape:"non_list",note:"public response received; no records extracted"};}catch(e){out.syllabus={status:"error",...err(e)};}
if([out.assets,out.technologies,out.syllabus].some(x=>x.status==="error")||(out.detail&&out.detail.status==="error"))out.status="partial";
console.log(JSON.stringify(out));if(out.status!=="ok")process.exitCode=1;
