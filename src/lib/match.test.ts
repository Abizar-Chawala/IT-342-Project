import { describe, expect, it } from "vitest";
import { recipesFor } from "../../server/engine/match";
import type { PantryProfile, Recipe } from "./types";

const profile: PantryProfile = {
  restrictions: [],
  also_avoid: null,
  likes: null,
  dislikes: null,
  cuisines: null,
  budget: null,
};

const recipes: Recipe[] = [
  {
    id: 1,
    title: "Rice Bowl",
    category: "Lunch",
    cuisine: "Asian",
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    servings: 2,
    difficulty: "Easy",
    ingredients: ["1 cup rice", "1 cup water"],
    instructions: ["Cook the rice."],
    tags: [],
  },
];

describe("recipe matching", () => {
  it("finds a recipe using only the supplied pantry", () => {
    const results = recipesFor(profile, ["rice"], 2, recipes);
    expect(results.nothingToBuy).toHaveLength(1);
    expect(results.nothingToBuy[0]?.pantry_matches).toBeGreaterThan(0);
  });

  it("returns no relevant matches when the pantry does not overlap", () => {
    const results = recipesFor(profile, ["spinach"], 2, recipes);
    expect(results.nothingToBuy).toHaveLength(0);
    expect(results.totalAfterFilter).toBe(1);
  });
});
