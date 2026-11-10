import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../server/passwords";

describe("password hashing", () => {
  it("verifies the correct password and rejects a different one", async () => {
    const hash = await hashPassword("thyme-example-password");
    expect(await verifyPassword("thyme-example-password", hash)).toBe(true);
    expect(await verifyPassword("not-the-password", hash)).toBe(false);
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("password", "invalid")).toBe(false);
  });
});
