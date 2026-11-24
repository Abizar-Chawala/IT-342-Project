import { createHash, randomBytes, randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { and, eq, gt, lt } from "drizzle-orm";
import { dbConfigured, getDb, pingDb } from "./db.ts";
import { profiles, sessions, users } from "../drizzle/schema.ts";
import { ALL_RECIPES, canonicalsByAlias, recipesFor, type PantryProfile } from "./engine/index.ts";
import { suggestIngredients } from "./suggest.ts";
import { getCatalogRecipes, getRecipeById, searchIngredients, searchRecipes } from "./catalog.ts";
import { hashPassword, verifyPassword } from "./passwords.ts";
import { describeError, fingerprint, logger } from "./logger.ts";
import { createRateLimiter } from "./rateLimit.ts";
import {
  LIMITS,
  parseExcludeList,
  parseIntParam,
  parseLogin,
  parseProfile,
  parseQueryText,
  parseRecipeRequest,
  parseRegistration,
} from "./validate.ts";

const sessionCookie = "thyme_session";
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;

export interface AppConfig {
  /** Only NODE_ENV=development: demo header, detailed error messages. */
  isDev: boolean;
  /** Sets the Secure flag on the session cookie. Needs HTTPS in front of the app. */
  cookieSecure: boolean;
  /** Number of proxies in front of the API (ALBs, nginx) so req.ip is the real client. */
  trustProxyHops: number;
  rateLimitEnabled: boolean;
  authRateMax: number;
  authRateWindowMs: number;
  apiRateMax: number;
}

function toInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return value !== undefined && Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env["NODE_ENV"];
  const isDev = nodeEnv === "development";
  const cookieSecure = env["COOKIE_SECURE"];
  return {
    isDev,
    cookieSecure:
      cookieSecure !== undefined ? cookieSecure === "true" : !isDev && nodeEnv !== "test",
    trustProxyHops: toInt(env["TRUST_PROXY_HOPS"], 1),
    rateLimitEnabled: env["RATE_LIMIT_DISABLED"] !== "true",
    authRateMax: toInt(env["AUTH_RATE_MAX"], 30),
    authRateWindowMs: toInt(env["AUTH_RATE_WINDOW_MINUTES"], 15) * 60_000,
    apiRateMax: toInt(env["API_RATE_MAX_PER_MINUTE"], 300),
  };
}

type AuthenticatedRequest = Request & { userId?: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(req: Request, name: string): string | undefined {
  const pair = req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!pair) return undefined;
  try {
    return decodeURIComponent(pair.slice(name.length + 1));
  } catch {
    return undefined; // malformed %-escape in the cookie: treat as signed out, not a 500
  }
}

async function sessionUserId(req: Request): Promise<string | undefined> {
  const token = readCookie(req, sessionCookie);
  if (!token) return undefined;
  const [session] = await getDb()
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return session?.userId;
}

/** Remove expired session rows. Called at start-up and hourly. */
export async function purgeExpiredSessions(): Promise<number> {
  const removed = await getDb()
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ tokenHash: sessions.tokenHash });
  return removed.length;
}

// Verifying against a throwaway hash when the email is unknown keeps login timing the same,
// so response time does not reveal which emails have accounts.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("thyme-timing-equalizer"));

function pgCodeOf(error: unknown): string | undefined {
  const direct = (error as { code?: unknown } | null)?.code;
  const nested = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  const code = typeof nested === "string" ? nested : direct;
  return typeof code === "string" ? code : undefined;
}

export function createApp(config: AppConfig = loadConfig()) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxyHops);

  function setSessionCookie(res: Response, token: string): void {
    res.cookie(sessionCookie, token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "strict",
      path: "/",
      maxAge: sessionLifetimeMs,
    });
  }

  function badRequest(res: Response, message: string): void {
    res.status(400).json({ error: message });
  }

  // ---- request id, access log, security headers --------------------------------------------
  app.use((req, res, next) => {
    const requestId = randomUUID();
    res.locals["requestId"] = requestId;
    res.setHeader("X-Request-Id", requestId);
    const started = process.hrtime.bigint();
    res.on("finish", () => {
      const path = req.originalUrl.split("?")[0] ?? "";
      if (path === "/api/health" && res.statusCode < 400) return; // keep ALB health checks out of the logs
      logger.info("http_request", {
        requestId,
        method: req.method,
        path,
        status: res.statusCode,
        ms: Number((process.hrtime.bigint() - started) / 1_000_000n),
        ip: req.ip,
        userId: res.locals["userId"],
      });
    });
    next();
  });

  app.use("/api", (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    if (req.secure)
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    next();
  });

  app.use(express.json({ limit: "32kb", type: "application/json" }));

  // ---- CSRF: browsers must send the API's own origin on state-changing requests --------------
  app.use("/api", (req, res, next): void => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const origin = req.get("origin");
      if (origin) {
        let originHost: string | undefined;
        try {
          originHost = new URL(origin).host;
        } catch {
          originHost = undefined; // e.g. "Origin: null"
        }
        const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
        if (!originHost || (originHost !== req.get("host") && originHost !== forwardedHost)) {
          logger.warn("csrf_rejected", {
            origin: origin.slice(0, 100),
            path: req.path,
            ip: req.ip,
          });
          res.status(403).json({ error: "Cross-origin request rejected." });
          return;
        }
      }
    }
    next();
  });

  // ---- health (ALB target group check) -------------------------------------------------------
  app.get("/api/health", async (req, res) => {
    if (req.query["deep"] === "1") {
      try {
        await pingDb();
      } catch (error) {
        logger.error("health_db_failed", describeError(error));
        res.status(503).json({ ok: false, db: "down" });
        return;
      }
      res.json({ ok: true, db: "up" });
      return;
    }
    res.json({ ok: true });
  });

  // ---- rate limiting -------------------------------------------------------------------------
  const passThrough = (_req: Request, _res: Response, next: NextFunction) => next();
  const apiLimiter = config.rateLimitEnabled
    ? createRateLimiter({ name: "api", windowMs: 60_000, max: config.apiRateMax })
    : passThrough;
  const loginLimiter = config.rateLimitEnabled
    ? createRateLimiter({
        name: "login",
        windowMs: config.authRateWindowMs,
        max: config.authRateMax,
      })
    : passThrough;
  const registerLimiter = config.rateLimitEnabled
    ? createRateLimiter({
        name: "register",
        windowMs: config.authRateWindowMs,
        max: config.authRateMax,
      })
    : passThrough;
  app.use("/api", apiLimiter);

  async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = await sessionUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Please sign in." });
      return;
    }
    (req as AuthenticatedRequest).userId = userId;
    res.locals["userId"] = userId;
    next();
  }

  // ---- authentication ------------------------------------------------------------------------
  app.get("/api/auth/session", async (req, res) => {
    const userId = await sessionUserId(req);
    if (!userId) {
      res.json({ user: null });
      return;
    }
    const [user] = await getDb()
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    res.json({ user: user ?? null });
  });

  app.post("/api/auth/register", registerLimiter, async (req, res): Promise<void> => {
    const input = parseRegistration(req.body);
    if (!input.ok) {
      logger.info("register_invalid", { ip: req.ip, reason: input.error });
      badRequest(res, input.error);
      return;
    }
    const { email, password } = input.value;

    const passwordHash = await hashPassword(password);
    const created = await getDb().transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email, passwordHash })
        .onConflictDoNothing()
        .returning({ id: users.id, email: users.email });
      if (!user) return null;
      await tx.insert(profiles).values({ userId: user.id });
      const token = randomBytes(32).toString("base64url");
      await tx.insert(sessions).values({
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + sessionLifetimeMs),
      });
      return { user, token };
    });

    if (!created) {
      logger.info("register_conflict", { ip: req.ip, emailFp: fingerprint(email) });
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    logger.info("register_success", { userId: created.user.id, ip: req.ip });
    res.locals["userId"] = created.user.id;
    setSessionCookie(res, created.token);
    res.status(201).json({ user: created.user });
  });

  app.post("/api/auth/login", loginLimiter, async (req, res): Promise<void> => {
    const input = parseLogin(req.body);
    if (!input.ok) {
      logger.info("login_invalid", { ip: req.ip, reason: input.error });
      badRequest(res, input.error);
      return;
    }
    const { email, password } = input.value;

    const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid) {
      logger.warn("login_failed", { ip: req.ip, emailFp: fingerprint(email) });
      res.status(401).json({ error: "Wrong email or password." });
      return;
    }

    const token = randomBytes(32).toString("base64url");
    await getDb()
      .insert(sessions)
      .values({
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + sessionLifetimeMs),
      });
    logger.info("login_success", { userId: user.id, ip: req.ip });
    res.locals["userId"] = user.id;
    setSessionCookie(res, token);
    res.json({ user: { id: user.id, email: user.email } });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = readCookie(req, sessionCookie);
    if (token) {
      await getDb()
        .delete(sessions)
        .where(eq(sessions.tokenHash, hashToken(token)));
    }
    res.clearCookie(sessionCookie, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "strict",
      path: "/",
    });
    res.json({ ok: true });
  });

  // ---- catalog lookup / search (PostgreSQL-backed) -------------------------------------------
  // Falls back to the bundled JSON files only for a local run with no database configured.
  const jsonFallback = () => config.isDev && !dbConfigured();

  app.get("/api/pantry", async (req, res) => {
    const q = parseQueryText(req.query["q"], "q", LIMITS.searchText);
    const exclude = parseExcludeList(req.query["exclude"]);
    if (!q.ok) return void badRequest(res, q.error);
    if (!exclude.ok) return void badRequest(res, exclude.error);
    if (!q.value) {
      res.json({ suggestions: [], ambiguous: false });
      return;
    }
    if (jsonFallback()) {
      res.json({
        suggestions: suggestIngredients(q.value, new Set(exclude.value)),
        ambiguous: (canonicalsByAlias.get(q.value.toLowerCase())?.length ?? 0) > 1,
      });
      return;
    }
    res.json(await searchIngredients(q.value, exclude.value));
  });

  app.get("/api/recipes/search", async (req, res) => {
    const q = parseQueryText(req.query["q"], "q", LIMITS.searchText);
    const category = parseQueryText(req.query["category"], "category", LIMITS.filterText);
    const cuisine = parseQueryText(req.query["cuisine"], "cuisine", LIMITS.filterText);
    const tag = parseQueryText(req.query["tag"], "tag", LIMITS.filterText);
    const limit = parseIntParam(req.query["limit"], "limit", {
      min: 1,
      max: LIMITS.searchLimitMax,
      fallback: 20,
    });
    const offset = parseIntParam(req.query["offset"], "offset", {
      min: 0,
      max: LIMITS.searchOffsetMax,
      fallback: 0,
    });
    for (const part of [q, category, cuisine, tag, limit, offset]) {
      if (!part.ok) return void badRequest(res, part.error);
    }
    if (!q.ok || !category.ok || !cuisine.ok || !tag.ok || !limit.ok || !offset.ok) return;

    const found = await searchRecipes({
      q: q.value,
      category: category.value,
      cuisine: cuisine.value,
      tag: tag.value,
      limit: limit.value,
      offset: offset.value,
    });
    res.json({ ...found, limit: limit.value, offset: offset.value });
  });

  app.get("/api/recipes/:id", async (req, res) => {
    const id = parseIntParam(req.params["id"], "id", { min: 1, max: 1_000_000, fallback: 0 });
    if (!id.ok || id.value === 0) return void badRequest(res, "Recipe id must be a number.");
    const recipe = await getRecipeById(id.value);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found." });
      return;
    }
    res.json({ recipe });
  });

  // ---- profile -------------------------------------------------------------------------------
  app.get("/api/profile", requireAuth, async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId!;
    const [profile] = await getDb()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    res.json({ profile: profile ?? null });
  });

  app.put("/api/profile", requireAuth, async (req, res): Promise<void> => {
    const input = parseProfile(req.body);
    if (!input.ok) return void badRequest(res, input.error);

    const userId = (req as AuthenticatedRequest).userId!;
    const values = input.value;
    const [profile] = await getDb()
      .insert(profiles)
      .values({ userId, ...values })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...values, updatedAt: new Date() },
      })
      .returning();
    res.json({ profile });
  });

  // ---- recipe matching -----------------------------------------------------------------------
  app.post("/api/recipes", async (req, res): Promise<void> => {
    const demo = config.isDev && req.get("x-thyme-demo") === "true";
    const userId = demo ? undefined : await sessionUserId(req);
    if (!userId && !demo) {
      res.status(401).json({ error: "Please sign in." });
      return;
    }
    if (userId) res.locals["userId"] = userId;

    const input = parseRecipeRequest(req.body);
    if (!input.ok) return void badRequest(res, input.error);
    const { pantry, servings } = input.value;

    const [profile] = userId
      ? await getDb().select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
      : [];
    const preferences: PantryProfile = {
      restrictions: profile?.restrictions ?? [],
      also_avoid: profile?.alsoAvoid ?? null,
      likes: profile?.likes ?? null,
      dislikes: profile?.dislikes ?? null,
      cuisines: profile?.cuisines ?? null,
      budget: profile?.budget == null ? null : Number(profile.budget),
    };
    const catalog = jsonFallback() ? ALL_RECIPES : await getCatalogRecipes();
    res.json({ results: recipesFor(preferences, pantry, servings, catalog), profile: preferences });
  });

  // ---- unknown routes and errors -------------------------------------------------------------
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const type = (error as { type?: unknown } | null)?.type;
    const status = (error as { status?: unknown } | null)?.status;
    const pgCode = pgCodeOf(error);

    if (type === "entity.parse.failed") {
      res.status(400).json({ error: "Request body must be valid JSON." });
      return;
    }
    if (type === "entity.too.large") {
      res.status(413).json({ error: "Request body is too large." });
      return;
    }
    if (typeof status === "number" && status >= 400 && status < 500) {
      res.status(status).json({ error: "Bad request." });
      return;
    }
    if (pgCode === "23505") {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    if (pgCode === "22001" || pgCode === "22003" || pgCode === "22P02") {
      badRequest(res, "One of the values is invalid or too long.");
      return;
    }

    logger.error("unhandled_error", {
      requestId: res.locals["requestId"],
      method: req.method,
      path: req.originalUrl.split("?")[0],
      ...describeError(error),
    });
    const message =
      config.isDev && error instanceof Error
        ? (error.message.split("\n")[0] ?? "Error")
        : "The server couldn't complete your request.";
    res.status(500).json({ error: message });
  });

  return app;
}
