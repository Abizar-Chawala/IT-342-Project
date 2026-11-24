import { describe, expect, it } from "vitest";
import { cleanText, isStrongPassword, isValidEmail, optionalText } from "./validation";

describe("server input validation", () => {
  it("accepts and trims valid text", () => {
    expect(cleanText("  rice  ", 100)).toBe("rice");
  });

  it("rejects control characters and oversized text", () => {
    expect(cleanText("rice\nDROP TABLE users", 100)).toBeNull();
    expect(cleanText("x".repeat(501))).toBeNull();
  });

  it("handles optional text safely", () => {
    expect(optionalText(null)).toBeNull();
    expect(optionalText("")).toBeNull();
    expect(optionalText("  italian  ")).toBe("italian");
    expect(optionalText(42)).toBeUndefined();
  });

  it("validates email shape and length", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail(`${"a".repeat(320)}@example.com`)).toBe(false);
  });

  it("requires strong passwords", () => {
    expect(isStrongPassword("StrongPass1!")).toBe(true);
    expect(isStrongPassword("weakpass")).toBe(false);
    expect(isStrongPassword("NoNumber!")).toBe(false);
    expect(isStrongPassword("NODIGITS!!")).toBe(false);
    expect(isStrongPassword("alllower1!")).toBe(false);
    expect(isStrongPassword("ALLUPPER1!")).toBe(false);
    expect(isStrongPassword("Short1!")).toBe(false);
  });
});
