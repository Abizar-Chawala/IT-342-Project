// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  parseExcludeList,
  parseIntParam,
  parseLogin,
  parseProfile,
  parseQueryText,
  parseRecipeRequest,
  parseRegistration,
} from "./validate.ts";

describe("registration / login validation", () => {
  it("normalizes a good email and keeps the password untouched", () => {
    const result = parseRegistration({ email: "  Student@NJIT.edu ", password: "Correct-horse9" });
    expect(result).toEqual({
      ok: true,
      value: { email: "student@njit.edu", password: "Correct-horse9" },
    });
  });

  it.each([
    ["SQL injection text", "' OR 1=1 --"],
    ["stacked query", "a@b.co'; DROP TABLE users;--"],
    ["no domain dot", "user@localhost"],
    ["null byte", "a\u0000@b.co"],
    ["too long", `${"a".repeat(260)}@x.com`],
    ["object (NoSQL style)", { $ne: null }],
    ["array", ["a@b.co"]],
    ["number", 42],
  ])("rejects a bad email: %s", (_label, email) => {
    expect(parseRegistration({ email, password: "longenough1" }).ok).toBe(false);
    expect(parseLogin({ email, password: "x" }).ok).toBe(false);
  });

  it("enforces password length on registration", () => {
    expect(parseRegistration({ email: "a@b.co", password: "short" }).ok).toBe(false);
    expect(parseRegistration({ email: "a@b.co", password: "alllowercase1!" }).ok).toBe(false);
    expect(parseRegistration({ email: "a@b.co", password: "NoSymbolsHere1" }).ok).toBe(false);
    expect(parseRegistration({ email: "a@b.co", password: "x".repeat(129) }).ok).toBe(false);
    expect(parseRegistration({ email: "a@b.co", password: { $gt: "" } }).ok).toBe(false);
  });

  it("rejects non-object bodies", () => {
    for (const body of [undefined, null, "text", 5, []]) {
      expect(parseRegistration(body).ok).toBe(false);
      expect(parseLogin(body).ok).toBe(false);
    }
  });
});

describe("profile validation", () => {
  const base = {
    restrictions: ["vegan"],
    also_avoid: "",
    likes: "garlic",
    dislikes: null,
    cuisines: "italian",
    budget: 5,
  };

  it("accepts a valid profile and formats the budget", () => {
    const result = parseProfile(base);
    expect(result.ok && result.value.budget).toBe("5.00");
    expect(result.ok && result.value.alsoAvoid).toBeNull();
  });

  it("only allows the known restriction options", () => {
    expect(parseProfile({ ...base, restrictions: ["<script>"] }).ok).toBe(false);
    expect(parseProfile({ ...base, restrictions: "vegan" }).ok).toBe(false);
  });

  it.each([-1, 10_001, Number.NaN, "abc", {}])("rejects budget %s", (budget) => {
    expect(parseProfile({ ...base, budget }).ok).toBe(false);
  });

  it("limits free-text length and characters", () => {
    expect(parseProfile({ ...base, likes: "x".repeat(501) }).ok).toBe(false);
    expect(parseProfile({ ...base, likes: "a\u0000b" }).ok).toBe(false);
    expect(parseProfile({ ...base, likes: 7 }).ok).toBe(false);
  });
});

describe("recipe request and query validation", () => {
  it("validates pantry and servings", () => {
    expect(parseRecipeRequest({ pantry: ["rice"], servings: 2 }).ok).toBe(true);
    expect(parseRecipeRequest({ pantry: ["rice"], servings: "3" }).ok).toBe(true);
    expect(parseRecipeRequest({ pantry: ["rice"], servings: 2.5 }).ok).toBe(false);
    expect(parseRecipeRequest({ pantry: ["rice"], servings: 13 }).ok).toBe(false);
    expect(parseRecipeRequest({ pantry: [""], servings: 2 }).ok).toBe(false);
    expect(parseRecipeRequest({ pantry: [1], servings: 2 }).ok).toBe(false);
    expect(parseRecipeRequest({ pantry: Array(101).fill("rice"), servings: 2 }).ok).toBe(false);
  });

  it("accepts only single text query values", () => {
    expect(parseQueryText(undefined, "q", 10)).toEqual({ ok: true, value: "" });
    expect(parseQueryText(" rice ", "q", 10)).toEqual({ ok: true, value: "rice" });
    expect(parseQueryText(["a", "b"], "q", 10).ok).toBe(false);
    expect(parseQueryText({ $ne: "x" }, "q", 10).ok).toBe(false);
    expect(parseQueryText("x".repeat(11), "q", 10).ok).toBe(false);
  });

  it("parses numeric parameters strictly", () => {
    const opts = { min: 1, max: 50, fallback: 20 };
    expect(parseIntParam(undefined, "limit", opts)).toEqual({ ok: true, value: 20 });
    expect(parseIntParam("10", "limit", opts)).toEqual({ ok: true, value: 10 });
    for (const bad of ["0", "51", "-1", "1;DROP TABLE recipes", "1e3", "abc", ["1"]]) {
      expect(parseIntParam(bad, "limit", opts).ok).toBe(false);
    }
  });

  it("splits the exclude list and caps it", () => {
    expect(parseExcludeList("rice, egg ,")).toEqual({ ok: true, value: ["rice", "egg"] });
    expect(parseExcludeList(Array(101).fill("a").join(",")).ok).toBe(false);
  });
});
