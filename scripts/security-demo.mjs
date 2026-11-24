#!/usr/bin/env node
/**
 * Milestone 2 evidence: sends attack-style requests to a running Thyme API and prints
 * what each layer did (validation -> 4xx, parameterized SQL -> no results / no bypass).
 *
 *   node scripts/security-demo.mjs                              # http://localhost:3001
 *   node scripts/security-demo.mjs https://your-site.example    # the deployed site
 *   node scripts/security-demo.mjs <url> --ratelimit            # also trips the login rate limit
 *
 * It creates one throwaway account (secdemo-<random>@example.test) and logs it out at the end.
 * Remove leftovers with:  DELETE FROM users WHERE email LIKE 'secdemo-%';
 * Exit code is 1 if any check fails.
 */
const base = (process.argv.find((a) => /^https?:\/\//.test(a)) ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
const withRateLimit = process.argv.includes("--ratelimit");
const rows = [];
let failed = 0;

async function call(method, path, { body, headers = {}, raw } = {}) {
  const payload = raw ?? (body === undefined ? undefined : JSON.stringify(body));
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(payload !== undefined && !headers["content-type"]
        ? { "content-type": "application/json" }
        : {}),
      ...headers,
    },
    body: payload,
    redirect: "manual",
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: res.status, headers: res.headers, text, json };
}

function record(group, name, expected, got, pass, note = "") {
  if (!pass) failed += 1;
  rows.push({ group, name, expected, got, pass, note });
}

async function expectStatus(group, name, expected, req) {
  const [method, path, opts] = req;
  const res = await call(method, path, opts);
  record(
    group,
    name,
    String(expected),
    String(res.status),
    res.status === expected,
    res.status === 429 ? "rate limited: wait 15 min or run with RATE_LIMIT_DISABLED=true" : "",
  );
  return res;
}

const rand = Math.random().toString(36).slice(2, 10);
const email = `secdemo-${rand}@example.test`;
const password = `Demo-${rand}-Pass1!`;
const longText = "a".repeat(5000);

// ---- A. Input validation on the auth endpoints ------------------------------------------------
const A = "A. Validation (auth)";
await expectStatus(A, "SQL injection text in email", 400, [
  "POST",
  "/api/auth/login",
  { body: { email: "' OR 1=1 --", password: "x" } },
]);
await expectStatus(A, "Object instead of strings (NoSQL style)", 400, [
  "POST",
  "/api/auth/login",
  { body: { email: { $ne: null }, password: { $ne: null } } },
]);
await expectStatus(A, "Array instead of string", 400, [
  "POST",
  "/api/auth/login",
  { body: { email: ["a@b.co"], password: "x" } },
]);
await expectStatus(A, "400-character email", 400, [
  "POST",
  "/api/auth/login",
  { body: { email: `${"a".repeat(400)}@x.com`, password: "x" } },
]);
await expectStatus(A, "Null byte in email", 400, [
  "POST",
  "/api/auth/login",
  { body: { email: "a\u0000@b.co", password: "x" } },
]);
await expectStatus(A, "Malformed JSON", 400, ["POST", "/api/auth/login", { raw: "{not json" }]);
await expectStatus(A, "Form-encoded body instead of JSON", 400, [
  "POST",
  "/api/auth/login",
  { raw: "email=a&password=b", headers: { "content-type": "application/x-www-form-urlencoded" } },
]);
await expectStatus(A, "100 KB request body", 413, [
  "POST",
  "/api/auth/login",
  { raw: JSON.stringify({ email: "a@b.co", password: "x".repeat(100_000) }) },
]);
await expectStatus(A, "Register with a 5-character password", 400, [
  "POST",
  "/api/auth/register",
  { body: { email: `short-${rand}@example.test`, password: "12345" } },
]);

// ---- B. Parameterized SQL: payloads that PASS validation are still harmless -------------------
const B = "B. Parameterized SQL";
await expectStatus(B, "Login bypass attempt (valid-looking email + ' OR '1'='1)", 401, [
  "POST",
  "/api/auth/login",
  { body: { email: "x'OR'1'='1@x.com", password: "' OR '1'='1" } },
]);
await expectStatus(B, "Stacked query in password: '; DROP TABLE users;--", 401, [
  "POST",
  "/api/auth/login",
  { body: { email: "a@b.co", password: "x'; DROP TABLE users;--" } },
]);

// ---- C. Search endpoints (PostgreSQL-backed) ---------------------------------------------------
const C = "C. Search / lookup";
const search = async (name, path, pred, expected) => {
  const res = await call("GET", path);
  record(
    C,
    name,
    expected,
    `${res.status}${res.json?.total !== undefined ? ` (total ${res.json.total})` : res.json?.suggestions ? ` (${res.json.suggestions.length} suggestions)` : ""}`,
    pred(res),
  );
};
await search(
  "Normal ingredient search: tomatoes",
  "/api/pantry?q=tomatoes",
  (r) => r.status === 200 && r.json.suggestions.some((s) => s.name === "tomato"),
  "200, includes tomato",
);
await search(
  "Normal recipe search: chicken",
  "/api/recipes/search?q=chicken",
  (r) => r.status === 200 && r.json.total > 0,
  "200, total > 0",
);
await search(
  "Ingredient SQLi: '; DROP TABLE ingredients; --",
  `/api/pantry?q=${encodeURIComponent("'; DROP TABLE ingredients; --")}`,
  (r) => r.status === 200 && r.json.suggestions.length === 0,
  "200, no suggestions",
);
await search(
  "Recipe UNION SELECT from users",
  `/api/recipes/search?q=${encodeURIComponent("' UNION SELECT password_hash, email FROM users --")}`,
  (r) => r.status === 200 && r.json.total === 0,
  "200, total 0",
);
await search(
  "LIKE wildcard % does not match everything",
  `/api/recipes/search?q=${encodeURIComponent("%")}`,
  (r) => r.status === 200 && r.json.total === 0,
  "200, total 0",
);
await search(
  "Regex characters .* and (((( are literal",
  `/api/pantry?q=${encodeURIComponent(".*((((")}`,
  (r) => r.status === 200 && r.json.suggestions.length === 0,
  "200, no suggestions",
);
await search(
  "limit=1000 (over the maximum)",
  "/api/recipes/search?limit=1000",
  (r) => r.status === 400,
  "400",
);
await search(
  "limit=1;DROP TABLE recipes",
  `/api/recipes/search?limit=${encodeURIComponent("1;DROP TABLE recipes")}`,
  (r) => r.status === 400,
  "400",
);
await search(
  "Recipe id '1 OR 1=1'",
  `/api/recipes/${encodeURIComponent("1 OR 1=1")}`,
  (r) => r.status === 400,
  "400",
);
await search(
  "5000-character search text",
  `/api/pantry?q=${longText}`,
  (r) => r.status === 400,
  "400",
);
await search("Repeated parameter ?q=a&q=b", "/api/pantry?q=a&q=b", (r) => r.status === 400, "400");

// ---- D. Sessions, CSRF, XSS ---------------------------------------------------------------------
const D = "D. Sessions / CSRF / XSS";
await expectStatus(D, "Profile without a session", 401, ["GET", "/api/profile"]);
await expectStatus(D, "Forged session cookie", 401, [
  "GET",
  "/api/profile",
  { headers: { cookie: "thyme_session=AAAAAAAAAAAAAAAA" } },
]);
await expectStatus(D, "Malformed cookie (%E0%A4%A) is not a 500", 401, [
  "GET",
  "/api/profile",
  { headers: { cookie: "thyme_session=%E0%A4%A" } },
]);
await expectStatus(D, "Cross-site POST (Origin: https://evil.example)", 403, [
  "POST",
  "/api/auth/login",
  { body: { email: "a@b.co", password: "x" }, headers: { origin: "https://evil.example" } },
]);
await expectStatus(D, "Cross-site POST (Origin: null)", 403, [
  "POST",
  "/api/auth/login",
  { body: { email: "a@b.co", password: "x" }, headers: { origin: "null" } },
]);

const reg = await call("POST", "/api/auth/register", { body: { email, password } });
record(
  D,
  "Register a throwaway account",
  "201",
  String(reg.status),
  reg.status === 201,
  reg.status === 429 ? "rate limited: wait or set RATE_LIMIT_DISABLED=true" : "",
);
const setCookie = reg.headers.get("set-cookie") ?? "";
const cookie = setCookie.split(";")[0];
const flags = [
  /HttpOnly/i.test(setCookie) && "HttpOnly",
  /SameSite=Strict/i.test(setCookie) && "SameSite=Strict",
  /Secure/i.test(setCookie) && "Secure",
]
  .filter(Boolean)
  .join(", ");
record(
  D,
  "Session cookie flags",
  "HttpOnly, SameSite=Strict" + (base.startsWith("https") ? ", Secure" : ""),
  flags,
  /HttpOnly/i.test(setCookie) &&
    /SameSite=Strict/i.test(setCookie) &&
    (!base.startsWith("https") || /Secure/i.test(setCookie)),
);
record(
  D,
  "Response never contains a password hash",
  "no 'pbkdf2'",
  reg.text.includes("pbkdf2") ? "hash leaked" : "clean",
  !reg.text.includes("pbkdf2"),
);

if (cookie) {
  const xss = await call("PUT", "/api/profile", {
    headers: { cookie },
    body: { restrictions: [], likes: "<script>alert(1)</script>", budget: 5 },
  });
  record(
    D,
    "XSS text stored as data; served as JSON + nosniff",
    "200, application/json, nosniff",
    `${xss.status}, ${xss.headers.get("content-type")?.split(";")[0]}, ${xss.headers.get("x-content-type-options")}`,
    xss.status === 200 &&
      (xss.headers.get("content-type") ?? "").includes("application/json") &&
      xss.headers.get("x-content-type-options") === "nosniff",
  );
  await expectStatus(D, "Restriction value '<script>' not in the allowed list", 400, [
    "PUT",
    "/api/profile",
    { headers: { cookie }, body: { restrictions: ["<script>"], budget: 5 } },
  ]);
  await expectStatus(D, "Budget -5", 400, [
    "PUT",
    "/api/profile",
    { headers: { cookie }, body: { restrictions: [], budget: -5 } },
  ]);
  await expectStatus(D, "Budget 1e9", 400, [
    "PUT",
    "/api/profile",
    { headers: { cookie }, body: { restrictions: [], budget: 1e9 } },
  ]);
  await expectStatus(D, "101 pantry items", 400, [
    "POST",
    "/api/recipes",
    { headers: { cookie }, body: { pantry: Array(101).fill("rice"), servings: 2 } },
  ]);
  await expectStatus(D, "Servings 2.5", 400, [
    "POST",
    "/api/recipes",
    { headers: { cookie }, body: { pantry: ["rice"], servings: 2.5 } },
  ]);
  const logout = await call("POST", "/api/auth/logout", { headers: { cookie } });
  const after = await call("GET", "/api/auth/session", { headers: { cookie } });
  record(
    D,
    "Logout invalidates the session",
    "user: null",
    `${logout.status}, user: ${JSON.stringify(after.json?.user ?? null)}`,
    logout.status === 200 && after.json?.user === null,
  );
}

// ---- E. Headers and integrity ---------------------------------------------------------------------
const E = "E. Headers / integrity";
const health = await call("GET", "/api/health");
record(
  E,
  "X-Powered-By is not sent",
  "absent",
  health.headers.get("x-powered-by") ?? "absent",
  !health.headers.has("x-powered-by"),
);
record(
  E,
  "Security headers present",
  "nosniff, DENY, no-store, CSP",
  [
    health.headers.get("x-content-type-options"),
    health.headers.get("x-frame-options"),
    health.headers.get("cache-control"),
    health.headers.has("content-security-policy") ? "CSP" : "no CSP",
  ].join(", "),
  health.headers.get("x-content-type-options") === "nosniff" &&
    health.headers.get("x-frame-options") === "DENY" &&
    health.headers.get("cache-control") === "no-store" &&
    health.headers.has("content-security-policy"),
);
const intact = await call("GET", "/api/recipes/search?limit=1");
record(
  E,
  "Database intact after all attacks (recipes still there)",
  "total > 0",
  `total ${intact.json?.total}`,
  intact.status === 200 && intact.json?.total > 0,
);
const people = await call("GET", "/api/pantry?q=rice");
record(
  E,
  "Ingredient lookup still works",
  "suggestions > 0",
  `${people.json?.suggestions?.length ?? 0} suggestions`,
  people.status === 200 && people.json?.suggestions?.length > 0,
);

// ---- F. Optional rate-limit demo -------------------------------------------------------------------
if (withRateLimit) {
  const F = "F. Rate limiting";
  let first429 = 0;
  for (let i = 1; i <= 45 && !first429; i++) {
    const res = await call("POST", "/api/auth/login", {
      body: { email: "nobody@example.test", password: "wrong-password" },
    });
    if (res.status === 429) first429 = i;
  }
  record(
    F,
    "Repeated bad logins are throttled",
    "429 after the limit",
    first429 ? `429 on attempt ${first429}` : "never throttled",
    first429 > 0,
    "this IP is now blocked from login for the rest of the window",
  );
}

// ---- report ------------------------------------------------------------------------------------------
console.log(`\nThyme security demo against ${base}\n`);
let group = "";
const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n));
for (const r of rows) {
  if (r.group !== group) {
    group = r.group;
    console.log(`\n${group}`);
    console.log(`  ${pad("Attack / check", 62)} ${pad("Expected", 28)} ${pad("Got", 32)} Result`);
  }
  console.log(
    `  ${pad(r.name, 62)} ${pad(r.expected, 28)} ${pad(r.got, 32)} ${r.pass ? "PASS" : "FAIL"}${r.note && !r.pass ? `  <- ${r.note}` : ""}`,
  );
}
console.log(
  `\n${rows.length - failed}/${rows.length} checks passed${failed ? ` (${failed} FAILED)` : ""}\n`,
);
process.exit(failed ? 1 : 0);
