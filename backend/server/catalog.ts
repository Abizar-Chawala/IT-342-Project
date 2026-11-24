import { sql } from "drizzle-orm";
import { getDb } from "./db.ts";
import type { Recipe } from "./types.ts";

/**
 * Database-backed lookups for the ingredient and recipe catalog (PostgreSQL / RDS).
 *
 * SQL injection protection: every user value is passed as a bound parameter ($1, $2, ...)
 * through Drizzle's `sql` template, never concatenated into the SQL text. Values used in
 * LIKE / regex patterns are additionally escaped so `%`, `_`, `.`, `*` etc. match literally.
 */

export interface Suggestion {
  name: string;
  alias?: string;
}

/** Escape a value for use inside a PostgreSQL regular expression. */
export function escapeRegex(text: string): string {
  return text.replace(/[\\^$.*+?()[\]{}|/-]/g, "\\$&");
}

/** Escape a value for LIKE/ILIKE patterns that use `ESCAPE '!'`. */
export function escapeLike(text: string): string {
  return text.replace(/[!%_]/g, "!$&");
}

/** The query plus simple singular forms, so "tomatoes" also finds "tomato" and "cheeses" finds "cheese". */
export function wordForms(query: string): string[] {
  const forms = new Set([query]);
  if (query.length > 3) {
    if (query.endsWith("ies")) forms.add(query.slice(0, -3) + "y");
    if (query.endsWith("es")) forms.add(query.slice(0, -2));
    if (query.endsWith("s") && !query.endsWith("ss")) forms.add(query.slice(0, -1));
  }
  return [...forms];
}

interface IngredientRow extends Record<string, unknown> {
  name: string;
  alias: string | null;
  rank: number;
}

/**
 * Ranked ingredient autocomplete (max 8):
 * 1 starts with / exact singular, 2 whole word, 3 word starts with, 4 contains, 5 alias only.
 */
export async function searchIngredients(
  query: string,
  exclude: string[] = [],
): Promise<{ suggestions: Suggestion[]; ambiguous: boolean }> {
  const q = query.toLowerCase().trim();
  if (!q) return { suggestions: [], ambiguous: false };

  const forms = wordForms(q);
  const esc = escapeRegex(q);
  const startsWith = `^${esc}`;
  const wholeWord = `(^|[ -])(${forms.map(escapeRegex).join("|")})([ -]|$)`;
  const wordStart = `(^|[ -])${esc}`;
  const db = getDb();

  const rows = (await db.execute(sql`
    SELECT name, alias, rank FROM (
      SELECT i.name AS name,
        (SELECT a FROM unnest(i.aliases) AS a
          WHERE lower(a) ~ ${startsWith} OR lower(a) IN ${forms} LIMIT 1) AS alias,
        CASE
          WHEN lower(i.name) ~ ${startsWith} OR lower(i.name) IN ${forms} THEN 1
          WHEN lower(i.name) ~ ${wholeWord} THEN 2
          WHEN lower(i.name) ~ ${wordStart} THEN 3
          WHEN lower(i.name) ~ ${esc} THEN 4
          ELSE 5
        END AS rank
      FROM ingredients i
    ) matches
    WHERE rank < 5 OR alias IS NOT NULL
    ORDER BY rank, length(name), name
    LIMIT 60
  `)) as unknown as IngredientRow[];

  const skip = new Set(exclude);
  const suggestions: Suggestion[] = [];
  for (const row of rows) {
    if (skip.has(row.name)) continue;
    suggestions.push(
      row.rank === 5 && row.alias ? { name: row.name, alias: row.alias } : { name: row.name },
    );
    if (suggestions.length === 8) break;
  }

  // "oregano" is both "fresh oregano" and "dried oregano": the UI then lets the user add the bare word.
  const [count] = (await db.execute(sql`
    SELECT count(*)::int AS n FROM ingredients i
    WHERE lower(i.name) = ${q}
       OR EXISTS (SELECT 1 FROM unnest(i.aliases) AS a WHERE lower(a) = ${q})
  `)) as unknown as { n: number }[];

  return { suggestions, ambiguous: (count?.n ?? 0) > 1 };
}

export interface RecipeSummary {
  id: number;
  title: string;
  category: string;
  cuisine: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredient_count: number;
}

export interface RecipeSearchInput {
  q: string;
  category: string;
  cuisine: string;
  tag: string;
  limit: number;
  offset: number;
}

/** Keyword search over title, cuisine, category and ingredient lines, with optional exact filters. */
export async function searchRecipes(
  input: RecipeSearchInput,
): Promise<{ total: number; results: RecipeSummary[] }> {
  const conditions = [sql`TRUE`];
  if (input.q) {
    const pattern = `%${escapeLike(input.q)}%`;
    conditions.push(sql`(
      title ILIKE ${pattern} ESCAPE '!'
      OR cuisine ILIKE ${pattern} ESCAPE '!'
      OR category ILIKE ${pattern} ESCAPE '!'
      OR EXISTS (SELECT 1 FROM unnest(ingredients) AS line WHERE line ILIKE ${pattern} ESCAPE '!')
    )`);
  }
  if (input.category) conditions.push(sql`lower(category) = ${input.category.toLowerCase()}`);
  if (input.cuisine) conditions.push(sql`lower(cuisine) = ${input.cuisine.toLowerCase()}`);
  if (input.tag)
    conditions.push(sql`${input.tag.toLowerCase()} = ANY (SELECT lower(t) FROM unnest(tags) AS t)`);

  const rows = (await getDb().execute(sql`
    SELECT id, title, category, cuisine, prep_time_minutes, cook_time_minutes, servings,
           difficulty, tags, cardinality(ingredients) AS ingredient_count,
           count(*) OVER ()::int AS total
    FROM recipes
    WHERE ${sql.join(conditions, sql` AND `)}
    ORDER BY title
    LIMIT ${input.limit} OFFSET ${input.offset}
  `)) as unknown as (RecipeSummary & { total: number })[];

  return {
    total: rows[0]?.total ?? 0,
    results: rows.map(({ total: _total, ...summary }) => summary),
  };
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const rows = (await getDb().execute(sql`
    SELECT id, title, category, cuisine, prep_time_minutes, cook_time_minutes, servings,
           difficulty, ingredients, instructions, tags
    FROM recipes WHERE id = ${id}
  `)) as unknown as Recipe[];
  return rows[0] ?? null;
}

let cache: { at: number; recipes: Recipe[] } | undefined;

/**
 * Every recipe, loaded from PostgreSQL and cached for a few minutes. The pantry matcher
 * (server/engine) scores these rows. Keeping the same objects between requests also keeps
 * the engine's parsed-recipe cache warm.
 */
export async function getCatalogRecipes(ttlMs = 5 * 60_000): Promise<Recipe[]> {
  if (cache && Date.now() - cache.at < ttlMs) return cache.recipes;
  const rows = (await getDb().execute(sql`
    SELECT id, title, category, cuisine, prep_time_minutes, cook_time_minutes, servings,
           difficulty, ingredients, instructions, tags
    FROM recipes ORDER BY id
  `)) as unknown as Recipe[];
  if (rows.length === 0) throw new Error("The recipes table is empty. Run `npm run db:seed`.");
  cache = { at: Date.now(), recipes: [...rows] };
  return cache.recipes;
}

export function clearCatalogCache(): void {
  cache = undefined;
}
