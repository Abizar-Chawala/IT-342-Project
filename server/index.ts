import "./env.ts";
import { createHash, randomBytes } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { closeDb, getDb } from "./db.ts";
import { profiles, sessions, users } from "../drizzle/schema.ts";
import { canonicalsByAlias, recipesFor, type PantryProfile } from "./engine/index.ts";
import { suggestIngredients } from "./suggest.ts";
import { hashPassword, verifyPassword } from "./passwords.ts";

const app = express();
const port = Number(process.env["PORT"] ?? 3001);
const sessionCookie = "thyme_session";
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;

type AuthenticatedRequest = Request & { userId?: string };
type ProfileInput = Omit<PantryProfile, "budget"> & { budget: number | null };

app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionLifetimeMs,
  });
}

function readCookie(req: Request, name: string): string | undefined {
  const pair = req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined;
}

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readCookie(req, sessionCookie);
  if (!token) {
    res.status(401).json({ error: "Please sign in." });
    return;
  }

  const [session] = await getDb()
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!session) {
    res.status(401).json({ error: "Please sign in." });
    return;
  }

  (req as AuthenticatedRequest).userId = session.userId;
  next();
}

app.use("/api", (req, res, next): void => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin && new URL(origin).host !== req.get("host")) {
      res.status(403).json({ error: "Cross-origin request rejected." });
      return;
    }
  }
  next();
});

app.get("/api/auth/session", async (req, res) => {
  const token = readCookie(req, sessionCookie);
  if (!token) {
    res.json({ user: null });
    return;
  }
  const [session] = await getDb()
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!session) {
    res.json({ user: null });
    return;
  }
  const [user] = await getDb()
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  res.json({ user: user ?? null });
});

app.post("/api/auth/register", async (req, res): Promise<void> => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6 || password.length > 256) {
    res.status(400).json({ error: "Enter a valid email and a password of at least 6 characters." });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await getDb()
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoNothing()
    .returning({ id: users.id, email: users.email });
  if (!user) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  await getDb().insert(profiles).values({ userId: user.id });
  const token = randomBytes(32).toString("base64url");
  await getDb()
    .insert(sessions)
    .values({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + sessionLifetimeMs),
    });
  setSessionCookie(res, token);
  res.status(201).json({ user });
});

app.post("/api/auth/login", async (req, res): Promise<void> => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
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
  setSessionCookie(res, token);
  res.json({ user: { id: user.id, email: user.email } });
});

app.post("/api/auth/logout", async (req, res) => {
  const token = readCookie(req, sessionCookie);
  if (token)
    await getDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashToken(token)));
  res.clearCookie(sessionCookie, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    path: "/",
  });
  res.json({ ok: true });
});

app.get("/api/pantry", (req, res) => {
  const query = typeof req.query["q"] === "string" ? req.query["q"] : "";
  const excluded = typeof req.query["exclude"] === "string" ? req.query["exclude"].split(",") : [];
  const ambiguous = (canonicalsByAlias.get(query.trim().toLowerCase())?.length ?? 0) > 1;
  res.json({ suggestions: suggestIngredients(query, new Set(excluded)), ambiguous });
});

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
  const body = req.body as Record<string, unknown>;
  const restrictions = body["restrictions"];
  const budgetValue = body["budget"];
  const budget = budgetValue === null || budgetValue === undefined ? null : Number(budgetValue);
  if (
    !Array.isArray(restrictions) ||
    restrictions.some((item) => typeof item !== "string") ||
    (budget !== null && (!Number.isFinite(budget) || budget < 0))
  ) {
    res.status(400).json({ error: "Invalid profile settings." });
    return;
  }

  const userId = (req as AuthenticatedRequest).userId!;
  const [profile] = await getDb()
    .insert(profiles)
    .values({
      userId,
      restrictions,
      alsoAvoid: typeof body["also_avoid"] === "string" ? body["also_avoid"] : null,
      likes: typeof body["likes"] === "string" ? body["likes"] : null,
      dislikes: typeof body["dislikes"] === "string" ? body["dislikes"] : null,
      cuisines: typeof body["cuisines"] === "string" ? body["cuisines"] : null,
      budget: budget === null ? null : String(budget),
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        restrictions,
        alsoAvoid: typeof body["also_avoid"] === "string" ? body["also_avoid"] : null,
        likes: typeof body["likes"] === "string" ? body["likes"] : null,
        dislikes: typeof body["dislikes"] === "string" ? body["dislikes"] : null,
        cuisines: typeof body["cuisines"] === "string" ? body["cuisines"] : null,
        budget: budget === null ? null : String(budget),
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json({ profile });
});

app.post("/api/recipes", async (req, res): Promise<void> => {
  const pantry = req.body.pantry;
  const servings = Number(req.body.servings);
  if (
    !Array.isArray(pantry) ||
    pantry.length > 100 ||
    pantry.some((item: unknown) => typeof item !== "string") ||
    !Number.isInteger(servings) ||
    servings < 1 ||
    servings > 12
  ) {
    res.status(400).json({ error: "Invalid pantry or serving size." });
    return;
  }

  const token = readCookie(req, sessionCookie);
  const demo = process.env["NODE_ENV"] !== "production" && req.get("x-thyme-demo") === "true";
  const [session] =
    token && !demo
      ? await getDb()
          .select({ userId: sessions.userId })
          .from(sessions)
          .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
          .limit(1)
      : [];
  if (!session && !demo) {
    res.status(401).json({ error: "Please sign in." });
    return;
  }
  const [profile] = session
    ? await getDb().select().from(profiles).where(eq(profiles.userId, session.userId)).limit(1)
    : [];
  const preferences: PantryProfile = {
    restrictions: profile?.restrictions ?? [],
    also_avoid: profile?.alsoAvoid ?? null,
    likes: profile?.likes ?? null,
    dislikes: profile?.dislikes ?? null,
    cuisines: profile?.cuisines ?? null,
    budget: profile?.budget == null ? null : Number(profile.budget),
  };
  res.json({ results: recipesFor(preferences, pantry, servings), profile: preferences });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(error);
  if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }
  const message =
    process.env["NODE_ENV"] !== "production" && error instanceof Error
      ? error.message
      : "The server couldn't complete your request.";
  res.status(500).json({ error: message });
});

app.listen(port, () => console.log(`Thyme API listening on port ${port}`));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await closeDb();
    process.exit(0);
  });
}
