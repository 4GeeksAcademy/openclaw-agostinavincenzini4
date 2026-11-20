#!/usr/bin/env node
// Read-only token check. Never prints response bodies or request headers.
const token = process.env.TOKEN_4GEEKS;
if (!token) {
  console.log("TOKEN_4GEEKS=missing");
  process.exit(2);
}
console.log("TOKEN_4GEEKS=present");
const rawBase = process.env.BREATHECODE_API_URL || "https://breathecode.herokuapp.com";
let url;
try {
  url = new URL("/v1/admissions/user/me", rawBase);
  if (!/^https?:$/.test(url.protocol)) throw new Error();
} catch {
  console.log("AUTH_CHECK=inconclusive; reason=invalid_base_url");
  process.exit(3);
}
try {
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Token ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  // Discard body immediately; do not let an unexpected payload enter logs.
  await response.body?.cancel();
  if (response.status >= 200 && response.status < 300) {
    console.log(`AUTH_CHECK=accepted; http=${response.status}; endpoint=user_me`);
  } else if (response.status === 401) {
    console.log("AUTH_CHECK=rejected; http=401; endpoint=user_me");
    process.exitCode = 1;
  } else if (response.status === 403) {
    console.log("AUTH_CHECK=authenticated_but_forbidden; http=403; endpoint=user_me");
    process.exitCode = 1;
  } else {
    console.log(`AUTH_CHECK=inconclusive; http=${response.status}; endpoint=user_me`);
    process.exitCode = 1;
  }
} catch (error) {
  const code = error?.cause?.code;
  const category = code === "ENOTFOUND" ? "dns" :
    code === "ECONNREFUSED" ? "connection_refused" :
    error?.name === "TimeoutError" ? "timeout" :
    error?.name === "TypeError" ? "network_or_tls" : "request_failed";
  console.log(`AUTH_CHECK=inconclusive; reason=${category}; endpoint=user_me`);
  process.exitCode = 1;
}
