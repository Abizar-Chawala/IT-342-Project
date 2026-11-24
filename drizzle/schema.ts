import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  restrictions: text("restrictions").array().notNull().default([]),
  alsoAvoid: text("also_avoid"),
  likes: text("likes"),
  dislikes: text("dislikes"),
  cuisines: text("cuisines"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/** Ingredient catalog: canonical names, aliases and estimated price per serving. */
export const ingredients = pgTable("ingredients", {
  name: varchar("name", { length: 120 }).primaryKey(),
  aliases: text("aliases").array().notNull().default([]),
  category: varchar("category", { length: 60 }).notNull(),
  estPrice: numeric("est_price", { precision: 8, scale: 2 }).notNull().default("0"),
});

/** Recipe catalog searched by /api/recipes/search and matched against the pantry. */
export const recipes = pgTable("recipes", {
  id: integer("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  cuisine: varchar("cuisine", { length: 80 }).notNull(),
  prepTimeMinutes: integer("prep_time_minutes").notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servings: integer("servings").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  tags: text("tags").array().notNull().default([]),
});
