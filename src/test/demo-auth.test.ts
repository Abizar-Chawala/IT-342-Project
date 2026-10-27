import { beforeEach, describe, expect, it } from "vitest";
import { endDemoSession, isDemoSession, startDemoSession } from "@/lib/demo-auth";

describe("local demo session", () => {
  beforeEach(() => {
    endDemoSession();
  });

  it("can be started and ended in development", () => {
    expect(isDemoSession()).toBe(false);

    startDemoSession();
    expect(isDemoSession()).toBe(true);

    endDemoSession();
    expect(isDemoSession()).toBe(false);
  });
});
