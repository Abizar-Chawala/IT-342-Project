import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../drizzle/schema.ts";

const required = ["RDS_HOSTNAME", "RDS_USERNAME", "RDS_PASSWORD", "RDS_DB_NAME", "RDS_PORT"];
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
let client: ReturnType<typeof postgres> | undefined;

/** True when every RDS_* variable is present (they come from systemd/Secrets Manager on AWS, .env locally). */
export function dbConfigured(): boolean {
  return required.every((name) => Boolean(process.env[name]));
}

export function getDb() {
  if (database) return database;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Database features require these environment variables: ${missing.join(", ")}`);
  }

  const connection = new URL(
    `postgresql://${encodeURIComponent(process.env["RDS_USERNAME"]!)}:${encodeURIComponent(
      process.env["RDS_PASSWORD"]!,
    )}@${process.env["RDS_HOSTNAME"]}:${process.env["RDS_PORT"]}/${encodeURIComponent(
      process.env["RDS_DB_NAME"]!,
    )}`,
  );
  client = postgres(connection.toString(), {
    ssl: process.env["RDS_SSL"] === "false" ? undefined : "require",
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });
  database = drizzle(client, { schema });
  return database;
}

/** Cheap connectivity check used by /api/health?deep=1 (ALB target health). */
export async function pingDb(): Promise<void> {
  await getDb().execute(sql`select 1`);
}

export async function closeDb(): Promise<void> {
  if (client) await client.end();
  client = undefined;
  database = undefined;
}
