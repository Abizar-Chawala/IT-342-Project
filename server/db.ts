import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema.ts";

const required = ["RDS_HOSTNAME", "RDS_USERNAME", "RDS_PASSWORD", "RDS_DB_NAME", "RDS_PORT"];
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
let client: ReturnType<typeof postgres> | undefined;

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
  client = postgres(connection.toString(), { ssl: "require" });
  database = drizzle(client, { schema });
  return database;
}

export async function closeDb(): Promise<void> {
  if (client) await client.end();
}
