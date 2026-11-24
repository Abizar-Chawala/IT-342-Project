import "./env.ts";
import { createApp, loadConfig, purgeExpiredSessions } from "./app.ts";
import { closeDb, dbConfigured } from "./db.ts";
import { describeError, logger } from "./logger.ts";

const config = loadConfig();
const app = createApp(config);
const port = Number(process.env["PORT"] ?? 3001);

const server = app.listen(port, () => {
  logger.info("server_started", {
    port,
    nodeEnv: process.env["NODE_ENV"] ?? "unset",
    cookieSecure: config.cookieSecure,
    trustProxyHops: config.trustProxyHops,
    rateLimitEnabled: config.rateLimitEnabled,
    databaseConfigured: dbConfigured(),
  });
});

async function cleanSessions(): Promise<void> {
  if (!dbConfigured()) return;
  try {
    const removed = await purgeExpiredSessions();
    if (removed > 0) logger.info("sessions_purged", { removed });
  } catch (error) {
    logger.error("sessions_purge_failed", describeError(error));
  }
}
void cleanSessions();
setInterval(() => void cleanSessions(), 60 * 60 * 1000).unref();

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", describeError(reason));
});
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", describeError(error));
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    logger.info("server_stopping", { signal });
    server.close(() => {
      void closeDb().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
