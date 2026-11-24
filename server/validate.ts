/**
 * Central input validation. Every value that arrives from a client (JSON body, query
 * string, path parameter) is parsed here BEFORE it is used. Database access is also
 * parameterized (Drizzle), so validation is the first of two layers against injection.
 */

import { isStrongPassword } from "./validation.ts";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (error: string): Result<never> => ({ ok: false, error });

export const RESTRICTION_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten free",
  "dairy free",
  "halal",
  "peanut",
  "tree nut",
  "egg",
  "shellfish",
  "soy",
  "fish",
] as const;

export const LIMITS = {
  email: 254,
  passwordMin: 8,
  passwordMax: 128,
  profileText: 500,
  pantryItems: 100,
  pantryItemLength: 100,
  excludeItems: 100,
  searchText: 100,
  filterText: 60,
  budgetMax: 10_000,
  searchLimitMax: 50,
  searchOffsetMax: 10_000,
} as const;

/** True when the text contains control characters (NUL, escape, ...); tab and line breaks are allowed. */
export function hasControlChars(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127) return true;
  }
  return false;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(value: unknown): Result<string> {
  if (typeof value !== "string") return fail("Email must be text.");
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > LIMITS.email || hasControlChars(email)) {
    return fail("Enter a valid email address.");
  }
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");
  return ok(email);
}

export function parseNewPassword(value: unknown): Result<string> {
  if (typeof value !== "string") return fail("Password must be text.");
  if (value.length < LIMITS.passwordMin || value.length > LIMITS.passwordMax) {
    return fail(`Password must be ${LIMITS.passwordMin}-${LIMITS.passwordMax} characters long.`);
  }
  // Rule written by Guna (server/validation.ts): upper, lower, number and symbol.
  if (!isStrongPassword(value)) {
    return fail("Password must include uppercase, lowercase, a number, and a symbol.");
  }
  return ok(value);
}

export function parseRegistration(body: unknown): Result<{ email: string; password: string }> {
  if (!isPlainObject(body)) return fail("Send a JSON object with email and password.");
  const email = parseEmail(body["email"]);
  if (!email.ok) return email;
  const password = parseNewPassword(body["password"]);
  if (!password.ok) return password;
  return ok({ email: email.value, password: password.value });
}

/** Login is lenient on password rules (old accounts) but still type- and length-checked. */
export function parseLogin(body: unknown): Result<{ email: string; password: string }> {
  if (!isPlainObject(body)) return fail("Send a JSON object with email and password.");
  const email = parseEmail(body["email"]);
  if (!email.ok) return email;
  const password = body["password"];
  if (typeof password !== "string" || password.length === 0) return fail("Password is required.");
  if (password.length > LIMITS.passwordMax) return fail("Wrong email or password.");
  return ok({ email: email.value, password });
}

function optionalText(value: unknown, label: string, max: number): Result<string | null> {
  if (value === undefined || value === null) return ok(null);
  if (typeof value !== "string") return fail(`${label} must be text.`);
  const text = value.trim();
  if (text.length === 0) return ok(null);
  if (text.length > max) return fail(`${label} must be at most ${max} characters.`);
  if (hasControlChars(text)) return fail(`${label} contains invalid characters.`);
  return ok(text);
}

export interface ProfileInput {
  restrictions: string[];
  alsoAvoid: string | null;
  likes: string | null;
  dislikes: string | null;
  cuisines: string | null;
  /** Dollars as a 2-decimal string for the numeric column, or null. */
  budget: string | null;
}

export function parseProfile(body: unknown): Result<ProfileInput> {
  if (!isPlainObject(body)) return fail("Invalid profile settings.");

  const restrictionsRaw = body["restrictions"];
  if (!Array.isArray(restrictionsRaw) || restrictionsRaw.length > RESTRICTION_OPTIONS.length) {
    return fail("Invalid restrictions.");
  }
  const allowed: readonly string[] = RESTRICTION_OPTIONS;
  const restrictions: string[] = [];
  for (const item of restrictionsRaw) {
    if (typeof item !== "string" || !allowed.includes(item)) return fail("Invalid restrictions.");
    if (!restrictions.includes(item)) restrictions.push(item);
  }

  const fields = {
    alsoAvoid: optionalText(body["also_avoid"], "Also avoid", LIMITS.profileText),
    likes: optionalText(body["likes"], "Likes", LIMITS.profileText),
    dislikes: optionalText(body["dislikes"], "Dislikes", LIMITS.profileText),
    cuisines: optionalText(body["cuisines"], "Cuisines", LIMITS.profileText),
  };
  for (const field of Object.values(fields)) if (!field.ok) return field;

  let budget: string | null = null;
  const budgetRaw = body["budget"];
  if (budgetRaw !== undefined && budgetRaw !== null && budgetRaw !== "") {
    const number =
      typeof budgetRaw === "number"
        ? budgetRaw
        : typeof budgetRaw === "string" && /^\d{1,6}(\.\d{1,2})?$/.test(budgetRaw.trim())
          ? Number(budgetRaw)
          : Number.NaN;
    if (!Number.isFinite(number) || number < 0 || number > LIMITS.budgetMax) {
      return fail(`Budget must be between 0 and ${LIMITS.budgetMax}.`);
    }
    budget = (Math.round(number * 100) / 100).toFixed(2);
  }

  // The `ok` checks above guarantee these are all ok results.
  const value = (r: Result<string | null>): string | null => (r.ok ? r.value : null);
  return ok({
    restrictions,
    alsoAvoid: value(fields.alsoAvoid),
    likes: value(fields.likes),
    dislikes: value(fields.dislikes),
    cuisines: value(fields.cuisines),
    budget,
  });
}

export function parseRecipeRequest(body: unknown): Result<{ pantry: string[]; servings: number }> {
  if (!isPlainObject(body)) return fail("Invalid pantry or serving size.");
  const pantryRaw = body["pantry"];
  if (!Array.isArray(pantryRaw) || pantryRaw.length > LIMITS.pantryItems) {
    return fail("Invalid pantry or serving size.");
  }
  const pantry: string[] = [];
  for (const item of pantryRaw) {
    if (typeof item !== "string") return fail("Invalid pantry or serving size.");
    const text = item.trim();
    if (text.length === 0 || text.length > LIMITS.pantryItemLength || hasControlChars(text)) {
      return fail("Invalid pantry or serving size.");
    }
    pantry.push(text);
  }
  const servingsRaw = body["servings"];
  const servings = typeof servingsRaw === "string" ? Number(servingsRaw) : servingsRaw;
  if (
    typeof servings !== "number" ||
    !Number.isInteger(servings) ||
    servings < 1 ||
    servings > 12
  ) {
    return fail("Invalid pantry or serving size.");
  }
  return ok({ pantry, servings });
}

/** Optional single query-string value (a repeated ?q=a&q=b or ?q[x]=y is rejected). */
export function parseQueryText(value: unknown, label: string, max: number): Result<string> {
  if (value === undefined) return ok("");
  if (typeof value !== "string") return fail(`${label} must be a single text value.`);
  const text = value.trim();
  if (text.length > max) return fail(`${label} must be at most ${max} characters.`);
  if (hasControlChars(text)) return fail(`${label} contains invalid characters.`);
  return ok(text);
}

export function parseExcludeList(value: unknown): Result<string[]> {
  const text = parseQueryText(value, "exclude", LIMITS.excludeItems * LIMITS.searchText);
  if (!text.ok) return text;
  if (!text.value) return ok([]);
  const items = text.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length > LIMITS.excludeItems || items.some((i) => i.length > LIMITS.searchText)) {
    return fail("Too many excluded ingredients.");
  }
  return ok(items);
}

export function parseIntParam(
  value: unknown,
  label: string,
  { min, max, fallback }: { min: number; max: number; fallback: number },
): Result<number> {
  if (value === undefined) return ok(fallback);
  if (typeof value !== "string" || !/^\d{1,9}$/.test(value))
    return fail(`${label} must be a number.`);
  const number = Number(value);
  if (number < min || number > max) return fail(`${label} must be between ${min} and ${max}.`);
  return ok(number);
}
