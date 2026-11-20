#!/usr/bin/env node
// Read-only queries for the authenticated user's task list. Cohort lookup is optional.
// Never logs auth material, raw response bodies, or unrelated personal data.
const token = process.env.TOKEN_4GEEKS;
function fatal(reason, extra = {}) {
  console.log(JSON.stringify({status: "error", reason, ...extra}));
  process.exit(1);
}
if (!token) fatal("token_missing");
let base;
try {
  const parsed = new URL(process.env.BREATHECODE_API_URL || "https://breathecode.herokuapp.com");
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error();
  base = parsed.origin;
} catch { fatal("invalid_base_url"); }
async function getJson(path, params = {}) {
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const response = await fetch(url, {
    method: "GET", headers: {Authorization: `Token ${token}`, Accept: "application/json"},
    signal: AbortSignal.timeout(20000), redirect: "error",
  });
  if (!response.ok) {
    await response.body?.cancel();
    const e = new Error("http"); e.httpStatus = response.status; throw e;
  }
  return response.json();
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return null;
}
const scalar = (obj, keys) => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && ["string", "number", "boolean"].includes(typeof v)) return v;
  }
  return null;
};
function safeError(e) {
  if (e?.httpStatus) return {kind: "http", httpStatus: e.httpStatus};
  const code = e?.cause?.code;
  return {kind: "request", reason: code === "ENOTFOUND" ? "dns" : code === "ECONNREFUSED" ? "connection_refused" : e?.name === "TimeoutError" ? "timeout" : e instanceof SyntaxError ? "invalid_json" : e?.name === "TypeError" ? "network_or_tls" : "request_failed"};
}
function identifyCohort(data) {
  const rows = rowsFrom(data);
  if (!rows) return {error: "unexpected_response_shape"};
  const matches = rows.filter(row => {
    const c = row?.cohort && typeof row.cohort === "object" ? row.cohort : row;
    const name = [c?.name, c?.slug, row?.cohort_name, row?.cohort_slug].filter(x => typeof x === "string").join(" ");
    return /ai[\s_-]*engineering/i.test(name);
  });
  const ids = [...new Set(matches.map(row => {
    const c = row?.cohort && typeof row.cohort === "object" ? row.cohort : row;
    return c?.id ?? row?.cohort_id;
  }).filter(id => typeof id === "number" || (typeof id === "string" && /^\d+$/.test(id))))];
  return ids.length === 1 ? {id: ids[0]} : {error: ids.length ? "ambiguous_ai_engineering_cohort" : "ai_engineering_cohort_not_found"};
}
let cohort = {status: "not_requested"};
try {
  const identified = identifyCohort(await getJson("/v1/admissions/academy/cohort/me"));
  cohort = identified.id !== undefined ? {status: "identified", name: "AI Engineering", id: identified.id} : {status: "unavailable", reason: identified.error};
} catch (e) {
  cohort = {status: "unavailable", ...safeError(e)};
}
const groups = [];
for (const status of ["PENDING", "REJECTED"]) {
  for (const type of ["PROJECT", "EXERCISE", "LESSON"]) {
    const items = []; let pageCount = 0; let queryError = null; const pageSize = 100;
    try {
      for (let page = 0; page < 10; page++) {
        const params = {task_status: status, task_type: type, limit: pageSize, offset: page * pageSize};
        if (cohort.status === "identified") params.cohort = cohort.id;
        const rows = rowsFrom(await getJson("/v1/assignment/user/me/task", params));
        if (!rows) { queryError = {reason: "unexpected_response_shape"}; break; }
        for (const row of rows) {
          const item = row && typeof row === "object" ? row : {};
          const result = {id: scalar(item, ["id", "task_id"]), title: scalar(item, ["title", "name", "description"]), status: scalar(item, ["task_status", "status"]) ?? status, type: scalar(item, ["task_type", "type"]) ?? type};
          const dueDate = scalar(item, ["due_date", "expires_at", "deadline"]);
          if (dueDate !== null) result.dueDate = dueDate;
          items.push(result);
        }
        pageCount++;
        if (rows.length < pageSize) break;
        if (page === 9) queryError = {reason: "pagination_limit_reached"};
      }
    } catch (e) { queryError = safeError(e); }
    groups.push(queryError ? {status, type, queryStatus: "error", ...queryError} : {status, type, queryStatus: "ok", count: items.length, items, pageCount, cohortFiltered: cohort.status === "identified"});
  }
}
const okCount = groups.filter(g => g.queryStatus === "ok").length;
console.log(JSON.stringify({status: okCount === groups.length ? "ok" : okCount ? "partial" : "error", cohort, groups}));
if (okCount !== groups.length) process.exitCode = 1;
