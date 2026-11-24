// @vitest-environment node
import "./env.ts"; // loads .env (database settings) when present
import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createApp, type AppConfig } from "./app.ts";
import { closeDb, getDb } from "./db.ts";
import { seedCatalog } from "./seed.ts";

process.env["LOG_LEVEL"] = "silent";

const config: AppConfig = {
  isDev: false,
  cookieSecure: false,
  trustProxyHops: 1,
  rateLimitEnabled: false,
  authRateMax: 30,
  authRateWindowMs: 15 * 60_000,
  apiRateMax: 300,
};
const hasDb = ["RDS_HOSTNAME", "RDS_USERNAME", "RDS_PASSWORD", "RDS_DB_NAME", "RDS_PORT"].every(
  (name) => Boolean(process.env[name]),
);

interface Reply {
  status: number;
  headers: http.IncomingHttpHeaders;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any;
}

function listen(app: ReturnType<typeof createApp>): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function request(
  server: Server,
  method: string,
  path: string,
  { body, headers = {} }: { body?: string | object; headers?: Record<string, string> } = {},
): Promise<Reply> {
  const payload =
    body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port: (server.address() as AddressInfo).port,
        method,
        path,
        headers: {
          ...(payload !== undefined ? { "content-type": "application/json" } : {}),
          ...headers,
        },
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let json: any;
          try {
            json = JSON.parse(text);
          } catch {
            json = undefined;
          }
          resolve({ status: res.statusCode ?? 0, headers: res.headers, text, json });
        });
      },
    );
    req.on("error", reject);
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

describe("API security without a database", () => {
  let server: Server;
  beforeAll(async () => {
    server = await listen(createApp(config));
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it("answers the health check and sends hardening headers", async () => {
    const res = await request(server, "GET", "/api/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["content-security-policy"]).toContain("default-src 'none'");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("rejects malformed JSON, oversized bodies and wrong content types with 4xx", async () => {
    expect((await request(server, "POST", "/api/auth/login", { body: "{not json" })).status).toBe(
      400,
    );
    expect(
      (await request(server, "POST", "/api/auth/login", { body: { a: "x".repeat(40_000) } }))
        .status,
    ).toBe(413);
    const form = await request(server, "POST", "/api/auth/login", {
      body: "email=a&password=b",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    expect(form.status).toBe(400);
  });

  it("rejects injection-shaped credentials before any database call", async () => {
    const payloads = [
      { email: "' OR 1=1 --", password: "x" },
      { email: { $ne: null }, password: { $ne: null } },
      { email: ["a@b.co"], password: "x" },
      { email: `${"a".repeat(400)}@x.com`, password: "x" },
    ];
    for (const body of payloads) {
      const res = await request(server, "POST", "/api/auth/login", { body });
      expect(res.status).toBe(400);
    }
    const reg = await request(server, "POST", "/api/auth/register", {
      body: { email: "a@b.co", password: "short" },
    });
    expect(reg.status).toBe(400);
  });

  it("rejects cross-origin state-changing requests", async () => {
    for (const origin of ["https://evil.example", "null"]) {
      const res = await request(server, "POST", "/api/auth/login", {
        body: { email: "a@b.co", password: "x" },
        headers: { origin },
      });
      expect(res.status).toBe(403);
    }
  });

  it("requires sign-in for the recipe matcher and returns JSON 404s", async () => {
    expect(
      (await request(server, "POST", "/api/recipes", { body: { pantry: ["rice"], servings: 2 } }))
        .status,
    ).toBe(401);
    const missing = await request(server, "GET", "/api/nope");
    expect(missing.status).toBe(404);
    expect(missing.json).toEqual({ error: "Not found." });
  });

  it("treats a malformed session cookie as signed out instead of crashing", async () => {
    const res = await request(server, "POST", "/api/recipes", {
      body: { pantry: ["rice"], servings: 2 },
      headers: { cookie: "thyme_session=%E0%A4%A" },
    });
    expect(res.status).toBe(401);
  });

  it("never turns query-string brackets into objects (Express 5 simple parser)", async () => {
    const res = await request(server, "GET", "/api/pantry?q[$ne]=x");
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ suggestions: [], ambiguous: false });
  });

  it("validates search parameters before touching the database", async () => {
    for (const path of [
      "/api/recipes/search?limit=1000",
      "/api/recipes/search?limit=1;DROP%20TABLE%20recipes",
      "/api/recipes/search?offset=-1",
      `/api/recipes/search?q=${"a".repeat(500)}`,
      "/api/recipes/1%20OR%201=1",
      "/api/pantry?q=a&q=b",
    ]) {
      expect((await request(server, "GET", path)).status, path).toBe(400);
    }
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After once the login limit is exceeded", async () => {
    const server = await listen(createApp({ ...config, rateLimitEnabled: true, authRateMax: 3 }));
    try {
      const statuses: number[] = [];
      for (let i = 0; i < 5; i++) {
        const res = await request(server, "POST", "/api/auth/login", { body: { nope: true } });
        statuses.push(res.status);
        if (res.status === 429) expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
      }
      expect(statuses).toEqual([400, 400, 400, 429, 429]);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe.skipIf(!hasDb)("API with the PostgreSQL data layer", () => {
  let server: Server;
  const email = `test-${randomUUID()}@example.test`;
  const password = "A-long-test-password1!";
  let cookie = "";

  beforeAll(async () => {
    await seedCatalog();
    server = await listen(createApp(config));
  });
  afterAll(async () => {
    await getDb().execute(sql`DELETE FROM users WHERE email = ${email}`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closeDb();
  });

  it("searches ingredients in the database with sensible ranking", async () => {
    const names = async (q: string) =>
      (
        (await request(server, "GET", `/api/pantry?q=${encodeURIComponent(q)}`)).json
          .suggestions as { name: string }[]
      ).map((s) => s.name);
    expect(await names("tomatoes")).toContain("tomato");
    expect((await names("eggs"))[0]).toBe("egg");
    expect(await names("peas")).not.toContain("peanut");
    expect(await names("cheeses")).toContain("cheddar cheese");
    const green = (await request(server, "GET", "/api/pantry?q=green%20onion")).json.suggestions[0];
    expect(green).toEqual({ name: "scallion", alias: "green onion" });
    expect((await request(server, "GET", "/api/pantry?q=oregano")).json.ambiguous).toBe(true);
  });

  it("is not injectable: payloads match nothing and the tables survive", async () => {
    for (const q of [
      "'; DROP TABLE ingredients; --",
      "' OR '1'='1",
      "%",
      "_",
      ".*",
      "((((",
      "\\",
    ]) {
      const res = await request(server, "GET", `/api/pantry?q=${encodeURIComponent(q)}`);
      expect(res.status, q).toBe(200);
      expect(res.json.suggestions, q).toEqual([]);
    }
    const union = await request(
      server,
      "GET",
      `/api/recipes/search?q=${encodeURIComponent("' UNION SELECT password_hash, email FROM users --")}`,
    );
    expect(union.status).toBe(200);
    expect(union.json.total).toBe(0);
    const wildcard = await request(
      server,
      "GET",
      `/api/recipes/search?q=${encodeURIComponent("%")}`,
    );
    expect(wildcard.json.total).toBe(0);
    const intact = await request(server, "GET", "/api/recipes/search?limit=1");
    expect(intact.json.total).toBe(100);
  });

  it("searches and fetches recipes from the database", async () => {
    const found = await request(server, "GET", "/api/recipes/search?q=chicken&limit=5");
    expect(found.json.total).toBeGreaterThan(0);
    expect(found.json.results.length).toBeLessThanOrEqual(5);
    const filtered = await request(
      server,
      "GET",
      "/api/recipes/search?cuisine=italian&tag=vegetarian",
    );
    expect(filtered.json.results.every((r: { cuisine: string }) => r.cuisine === "Italian")).toBe(
      true,
    );
    const one = await request(server, "GET", `/api/recipes/${found.json.results[0].id}`);
    expect(one.json.recipe.instructions.length).toBeGreaterThan(0);
    expect((await request(server, "GET", "/api/recipes/999999")).status).toBe(404);
  });

  it("registers, hashes the password, signs in, saves a profile and matches recipes", async () => {
    const reg = await request(server, "POST", "/api/auth/register", { body: { email, password } });
    expect(reg.status).toBe(201);
    expect(JSON.stringify(reg.json)).not.toContain("pbkdf2");
    const setCookie = reg.headers["set-cookie"]?.[0] ?? "";
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
    cookie = setCookie.split(";")[0] ?? "";

    const stored = (await getDb().execute(
      sql`SELECT password_hash FROM users WHERE email = ${email}`,
    )) as unknown as { password_hash: string }[];
    expect(stored[0]?.password_hash).toMatch(/^pbkdf2-sha256\$310000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    expect(stored[0]?.password_hash).not.toContain(password);

    expect(
      (await request(server, "POST", "/api/auth/register", { body: { email, password } })).status,
    ).toBe(409);
    expect(
      (
        await request(server, "POST", "/api/auth/login", {
          body: { email, password: "wrong-password" },
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await request(server, "POST", "/api/auth/login", {
          body: { email: "x'OR'1'='1@x.com", password: "' OR '1'='1" },
        })
      ).status,
    ).toBe(401);
    const login = await request(server, "POST", "/api/auth/login", { body: { email, password } });
    expect(login.status).toBe(200);

    const saved = await request(server, "PUT", "/api/profile", {
      headers: { cookie },
      body: { restrictions: ["vegetarian"], likes: "<script>alert(1)</script>", budget: 6.5 },
    });
    expect(saved.status).toBe(200);
    expect(saved.headers["content-type"]).toContain("application/json");
    expect(saved.json.profile.budget).toBe("6.50");
    expect(
      (
        await request(server, "PUT", "/api/profile", {
          headers: { cookie },
          body: { restrictions: ["<b>"], budget: 1 },
        })
      ).status,
    ).toBe(400);

    const matched = await request(server, "POST", "/api/recipes", {
      headers: { cookie },
      body: { pantry: ["rice", "egg", "onion"], servings: 2 },
    });
    expect(matched.status).toBe(200);
    expect(matched.json.results.totalBeforeFilter).toBe(100);
    expect(matched.json.results.totalAfterFilter).toBeLessThan(100); // vegetarian filter applied

    const out = await request(server, "POST", "/api/auth/logout", { headers: { cookie } });
    expect(out.status).toBe(200);
    const after = await request(server, "GET", "/api/auth/session", { headers: { cookie } });
    expect(after.json.user).toBeNull();
  });
});
