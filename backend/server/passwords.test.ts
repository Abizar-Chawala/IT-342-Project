import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./passwords";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const encoded = await hashPassword("milestone-two-password");
    await expect(verifyPassword("milestone-two-password", encoded)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const encoded = await hashPassword("milestone-two-password");
    await expect(verifyPassword("wrong-password", encoded)).resolves.toBe(false);
  });

  it("rejects malformed hashes", async () => {
    await expect(verifyPassword("password", "not-a-valid-hash")).resolves.toBe(false);
  });
});
