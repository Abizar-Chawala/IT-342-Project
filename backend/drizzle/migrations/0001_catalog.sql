-- Milestone 2: ingredient + recipe catalog (searched through the API) and session indexes.
-- Safe to run more than once. Apply with:  psql "host=<rds-endpoint> dbname=thyme user=<user> sslmode=require" -f drizzle/migrations/0001_catalog.sql
-- (or let `npm run db:push` create everything from drizzle/schema.ts).

CREATE TABLE IF NOT EXISTS "ingredients" (
  "name" varchar(120) PRIMARY KEY NOT NULL,
  "aliases" text[] DEFAULT '{}'::text[] NOT NULL,
  "category" varchar(60) NOT NULL,
  "est_price" numeric(8, 2) DEFAULT '0' NOT NULL
);

CREATE TABLE IF NOT EXISTS "recipes" (
  "id" integer PRIMARY KEY NOT NULL,
  "title" varchar(200) NOT NULL,
  "category" varchar(80) NOT NULL,
  "cuisine" varchar(80) NOT NULL,
  "prep_time_minutes" integer NOT NULL,
  "cook_time_minutes" integer NOT NULL,
  "servings" integer NOT NULL,
  "difficulty" varchar(20) NOT NULL,
  "ingredients" text[] NOT NULL,
  "instructions" text[] NOT NULL,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL
);

CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" ("expires_at");
