#!/usr/bin/env node
// Read-only aggregate progress report for authenticated current user.
// Never logs credentials, task records, raw response bodies, or third-party data.
const token = process.env.TOKEN_4GEEKS;
const fail = (reason, extra = {}) => { console.log(JSON.stringify({status: "error", reason, ...extra})); process.exit(1); };
if (!token) fail("token_missing");
let base;
try {
  const u = new URL(process.env.BREATHECODE_API_URL || "https://breathecode.herokuapp.com");
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) throw new Error();
  base = u.origin;
} catch { fail("invalid_base_url"); }
function safeError(e) {
  if (e?.httpStatus) return {kind: "http", httpStatus: e.httpStatus};
  const code = e?.cause?.code;
  return {kind: "request", reason: code === "ENOTFOUND" ? "dns" : code === "ECONNREFUSED" ? "connection_refused" : e?.name === "TimeoutError" ? "timeout" : e instanceof SyntaxError ? "invalid_json" : e?.name === "TypeError" ? "network_or_tls" : "request_failed"};
}
async function getJson(path, params = {}) {
  const u = new URL(path, base);
  for (const [k,v] of Object.entries(params)) u.searchParams.set(k, String(v));
  const r = await fetch(u, {method:"GET", headers:{Authorization:`Token ${token}`,Accept:"application/json"}, signal:AbortSignal.timeout(20000), redirect:"error"});
  if (!r.ok) { await r.body?.cancel(); const e = new Error("http"); e.httpStatus = r.status; throw e; }
  return r.json();
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return null;
}
const counts = {byStatus:{}, byType:{}};
let total = 0, recognized = 0, unknown = 0, pageCount = 0, truncated = false;
try {
  const pageSize = 100;
  for (let page = 0; page < 100; page++) {
    const data = await getJson("/v1/assignment/user/me/task", {limit:pageSize,offset:page*pageSize});
    const rows = rowsFrom(data);
    if (!rows) fail("unexpected_task_response_shape", {taskProgress:{status:"unavailable"}});
    pageCount++;
    for (const item of rows) {
      total++;
      const status = typeof item?.task_status === "string" ? item.task_status : typeof item?.status === "string" ? item.status : null;
      const type = typeof item?.task_type === "string" ? item.task_type : typeof item?.type === "string" ? item.type : null;
      if (status) counts.byStatus[status] = (counts.byStatus[status] || 0) + 1;
      if (type) counts.byType[type] = (counts.byType[type] || 0) + 1;
      if (["DONE","APPROVED","PENDING","REJECTED"].includes(status)) recognized++;
      else unknown++;
    }
    if (rows.length < pageSize) break;
    if (page === 99) truncated = true;
  }
  let activity;
  try {
    const raw = await getJson("/v1/activity/me");
    // API shape varies; don't surface values unless explicit aggregate numeric fields are evident.
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const allowed = ["total_minutes","minutes","total_time","exercises_completed","completed_exercises","activity_count"];
      const metrics = {};
      for (const k of allowed) if (typeof raw[k] === "number" && Number.isFinite(raw[k])) metrics[k] = raw[k];
      activity = {status:"ok", metrics};
    } else activity = {status:"ok", metrics:{}, note:"response_shape_not_aggregated"};
  } catch (e) { activity = {status:"unavailable", ...safeError(e)}; }
  const done = (counts.byStatus.DONE || 0) + (counts.byStatus.APPROVED || 0);
  const completePct = !truncated && unknown === 0 && recognized > 0 ? Math.round(done / recognized * 10000) / 100 : null;
  console.log(JSON.stringify({status:truncated?"partial":"ok", taskProgress:{status:truncated?"partial":"complete",totalTasks:total,byStatus:counts.byStatus,byType:counts.byType,completedTasks:done,pendingTasks:counts.byStatus.PENDING||0,rejectedTasks:counts.byStatus.REJECTED||0,completionPercent:completePct,percentBasis:completePct===null?null:"(DONE + APPROVED) / all tasks with recognized statuses × 100",recognizedStatusTasks:recognized,unknownStatusTasks:unknown,pages:pageCount}, activity, officialProgramProgress:{status:"not_available",note:"No official program progress metric was identified in the documented endpoints or queried responses."}}));
  if (truncated) process.exitCode=1;
} catch (e) {
  console.log(JSON.stringify({status:"error",taskProgress:{status:"unavailable",...safeError(e)}}));
  process.exitCode=1;
}
