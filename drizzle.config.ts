import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile();

const required = [
  "RDS_HOSTNAME",
  "RDS_USERNAME",
  "RDS_PASSWORD",
  "RDS_DB_NAME",
  "RDS_PORT",
] as const;
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Missing RDS environment variables: ${missing.join(", ")}`);
}

const connection = new URL(
  `postgresql://${encodeURIComponent(process.env.RDS_USERNAME!)}:${encodeURIComponent(
    process.env.RDS_PASSWORD!,
  )}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${encodeURIComponent(
    process.env.RDS_DB_NAME!,
  )}`,
);
connection.searchParams.set("sslmode", "require");

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: { url: connection.toString() },
});
