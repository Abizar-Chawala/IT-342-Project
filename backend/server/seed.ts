import "./env.ts";
import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { closeDb, getDb } from "./db.ts";
import { ingredients, recipes } from "../drizzle/schema.ts";
import { ALL_RECIPES, INGREDIENTS } from "./engine/data.ts";

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Load the JSON catalog (server/data) into PostgreSQL. Idempotent: existing rows are updated. */
export async function seedCatalog(): Promise<{ ingredients: number; recipes: number }> {
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const batch of chunks(INGREDIENTS, 100)) {
      await tx
        .insert(ingredients)
        .values(
          batch.map((i) => ({
            name: i.name,
            aliases: i.aliases,
            category: i.category,
            estPrice: i.est_price.toFixed(2),
          })),
        )
        .onConflictDoUpdate({
          target: ingredients.name,
          set: {
            aliases: sql`excluded.aliases`,
            category: sql`excluded.category`,
            estPrice: sql`excluded.est_price`,
          },
        });
    }
    for (const batch of chunks(ALL_RECIPES, 25)) {
      await tx
        .insert(recipes)
        .values(
          batch.map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            cuisine: r.cuisine,
            prepTimeMinutes: r.prep_time_minutes,
            cookTimeMinutes: r.cook_time_minutes,
            servings: r.servings,
            difficulty: r.difficulty,
            ingredients: r.ingredients,
            instructions: r.instructions,
            tags: r.tags,
          })),
        )
        .onConflictDoUpdate({
          target: recipes.id,
          set: {
            title: sql`excluded.title`,
            category: sql`excluded.category`,
            cuisine: sql`excluded.cuisine`,
            prepTimeMinutes: sql`excluded.prep_time_minutes`,
            cookTimeMinutes: sql`excluded.cook_time_minutes`,
            servings: sql`excluded.servings`,
            difficulty: sql`excluded.difficulty`,
            ingredients: sql`excluded.ingredients`,
            instructions: sql`excluded.instructions`,
            tags: sql`excluded.tags`,
          },
        });
    }
  });
  return { ingredients: INGREDIENTS.length, recipes: ALL_RECIPES.length };
}

// Run only when executed directly (`npm run db:seed`), not when imported by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedCatalog()
    .then((counts) => {
      console.log(`Seeded ${counts.ingredients} ingredients and ${counts.recipes} recipes.`);
    })
    .catch((error: unknown) => {
      console.error(
        error instanceof Error &&
          /relation .* does not exist/.test(String(error.cause ?? error.message))
          ? "Tables are missing. Run `npm run db:push` first."
          : error,
      );
      process.exitCode = 1;
    })
    .finally(() => closeDb());
}
