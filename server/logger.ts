import { createHash } from "node:crypto";

/**
 * Structured (JSON-lines) logger. One JSON object per line on stdout so the
 * CloudWatch agent can ship it and CloudWatch Logs Insights / metric filters can
 * query fields such as $.event and $.status.
 *
 * Never pass passwords, tokens, cookies, full emails or request bodies in here.
 */
type Level = "debug" | "info" | "warn" | "error";

const order: Record<Level | "silent", number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function threshold(): number {
  const configured = process.env["LOG_LEVEL"];
  return configured !== undefined && Object.hasOwn(order, configured)
    ? order[configured as Level | "silent"]
    : order.info;
}

export function log(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  if (order[level] < threshold()) return;
  process.stdout.write(
    JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields }) + "\n",
  );
}

export const logger = {
  debug: (event: string, fields?: Record<string, unknown>) => log("debug", event, fields),
  info: (event: string, fields?: Record<string, unknown>) => log("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => log("warn", event, fields),
  error: (event: string, fields?: Record<string, unknown>) => log("error", event, fields),
};

/** Short, non-reversible id so repeated failures for one email can be correlated without logging it. */
export function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

/**
 * Safe error summary. Drizzle puts the SQL parameters (emails, password hashes) on the
 * 2nd+ lines of error.message, so only the first line is kept, and the underlying
 * Postgres error code is surfaced from error.cause.
 */
export function describeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { errorName: typeof error };
  const cause = error.cause as { code?: unknown; message?: unknown } | undefined;
  const stack = (error.stack ?? "")
    .split("\n")
    .filter((line) => line.trimStart().startsWith("at "))
    .slice(0, 6)
    .map((line) => line.trim());
  return {
    errorName: error.name,
    errorMessage: error.message.split("\n")[0]?.slice(0, 300),
    ...(typeof cause?.code === "string" ? { pgCode: cause.code } : {}),
    ...(typeof cause?.message === "string"
      ? { pgMessage: cause.message.split("\n")[0]?.slice(0, 300) }
      : {}),
    stack,
  };
}
