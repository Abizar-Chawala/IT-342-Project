import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema.ts";

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const connection = new URL(
  `postgresql://${encodeURIComponent(requiredEnvironment("RDS_USERNAME"))}:${encodeURIComponent(
    requiredEnvironment("RDS_PASSWORD"),
  )}@${requiredEnvironment("RDS_HOSTNAME")}:${requiredEnvironment("RDS_PORT")}/${encodeURIComponent(
    requiredEnvironment("RDS_DB_NAME"),
  )}`,
);

export const sql = postgres(connection.toString(), { ssl: "require" });
export const db = drizzle(sql, { schema });
