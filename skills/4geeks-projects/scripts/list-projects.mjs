#!/usr/bin/env node
// Read-only fetch of the authenticated user's assigned PROJECT tasks.
// Does not log auth material or raw API response.
const token = process.env.TOKEN_4GEEKS;
if (!token) {
  console.log(JSON.stringify({status: "error", reason: "token_missing", projects: []}));
  process.exit(2);
}
const rawBase = process.env.BREATHECODE_API_URL || "https://breathecode.herokuapp.com";
let base;
try {
  const parsed = new URL(rawBase);
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error();
  base = parsed.origin;
} catch {
  console.log(JSON.stringify({status: "error", reason: "invalid_base_url", projects: []}));
  process.exit(3);
}
const projects = [];
const pageSize = 100;
try {
  for (let page = 0; page < 10; page++) {
    const url = new URL("/v1/assignment/user/me/task", base);
    url.searchParams.set("task_type", "PROJECT");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(page * pageSize));
    const response = await fetch(url, {
      method: "GET",
      headers: {Authorization: `Token ${token}`, Accept: "application/json"},
      signal: AbortSignal.timeout(20000),
      redirect: "error",
    });
    if (!response.ok) {
      await response.body?.cancel();
      console.log(JSON.stringify({status: "http_error", httpStatus: response.status, projects: []}));
      process.exit(1);
    }
    const data = await response.json();
    const rows = Array.isArray(data) ? data :
      Array.isArray(data?.results) ? data.results :
      Array.isArray(data?.data) ? data.data : null;
    if (!rows) {
      console.log(JSON.stringify({status: "unexpected_response_shape", projects: []}));
      process.exit(1);
    }
    for (const row of rows) {
      const task = row && typeof row === "object" ? row : {};
      const related = task.asset && typeof task.asset === "object" ? task.asset :
        task.project && typeof task.project === "object" ? task.project : {};
      const value = (...keys) => {
        for (const source of [task, related]) {
          for (const key of keys) {
            const item = source[key];
            if (item !== undefined && item !== null && ["string", "number", "boolean"].includes(typeof item)) return item;
          }
        }
        return null;
      };
      projects.push({
        id: value("id", "task_id"),
        title: value("title", "name", "description"),
        status: value("task_status", "status"),
        type: value("task_type", "type"),
        dueDate: value("due_date", "expires_at", "deadline"),
        deliveredAt: value("delivered_at", "submitted_at", "completed_at"),
        deliveryStatus: value("delivery_status", "submission_status"),
      });
    }
    if (rows.length < pageSize) break;
  }
  console.log(JSON.stringify({status: "ok", count: projects.length, projects}));
} catch (error) {
  const code = error?.cause?.code;
  const reason = code === "ENOTFOUND" ? "dns" :
    code === "ECONNREFUSED" ? "connection_refused" :
    error?.name === "TimeoutError" ? "timeout" :
    error instanceof SyntaxError ? "invalid_json" :
    error?.name === "TypeError" ? "network_or_tls" : "request_failed";
  console.log(JSON.stringify({status: "error", reason, projects: []}));
  process.exit(1);
}
