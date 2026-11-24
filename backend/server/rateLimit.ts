import type { RequestHandler } from "express";
import { logger } from "./logger.ts";

export interface RateLimitOptions {
  /** Label used in logs. */
  name: string;
  windowMs: number;
  max: number;
}

/**
 * Small fixed-window, in-memory limiter keyed by client IP (req.ip, which honours the
 * `trust proxy` hop count). Counters are per API instance; with several app servers behind
 * the internal load balancer the effective limit is max x instances. AWS WAF rate-based
 * rules are the next step for Milestone 3.
 */
export function createRateLimiter({ name, windowMs, max }: RateLimitOptions): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size > 50_000) hits.clear();
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      logger.warn("rate_limited", { limiter: name, ip: key, path: req.path, retryAfter });
      res.status(429).json({ error: "Too many requests. Please wait and try again." });
      return;
    }
    next();
  };
}
