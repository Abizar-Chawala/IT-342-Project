import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IngredientSearch } from "@/components/IngredientSearch";
import { canonicalsByAlias } from "../../server/engine/index";
import { suggestIngredients } from "../../server/suggest";

describe("IngredientSearch", () => {
  afterEach(() => vi.unstubAllGlobals());

  function mockPantryApi() {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(String(input), "http://localhost");
        const query = url.searchParams.get("q") ?? "";
        const excluded = new Set(url.searchParams.get("exclude")?.split(",").filter(Boolean));
        return new Response(
          JSON.stringify({
            suggestions: suggestIngredients(query, excluded),
            ambiguous: (canonicalsByAlias.get(query.trim().toLowerCase())?.length ?? 0) > 1,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );
  }

  it("keeps an ambiguous ingredient alias generic when selected with Enter", () => {
    mockPantryApi();
    const onAdd = vi.fn();

    render(<IngredientSearch selected={[]} onAdd={onAdd} onRemove={vi.fn()} />);
    const input = screen.getByRole("textbox", { name: "Search ingredients" });
    fireEvent.change(input, { target: { value: "oregano" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("oregano");
  });

  it("requires a catalog suggestion when custom entries are disabled", () => {
    mockPantryApi();
    const onAdd = vi.fn();

    render(<IngredientSearch selected={[]} onAdd={onAdd} onRemove={vi.fn()} allowCustom={false} />);
    const input = screen.getByRole("textbox", { name: "Search ingredients" });
    fireEvent.change(input, { target: { value: "not an ingredient" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).not.toHaveBeenCalled();
    return waitFor(() =>
      expect(screen.getByText("No matching catalog ingredient. Try another search.")).toBeVisible(),
    );
  });

  it("adds a selected catalog suggestion when custom entries are disabled", async () => {
    mockPantryApi();
    const onAdd = vi.fn();

    render(<IngredientSearch selected={[]} onAdd={onAdd} onRemove={vi.fn()} allowCustom={false} />);
    const input = screen.getByRole("textbox", { name: "Search ingredients" });
    fireEvent.change(input, { target: { value: "cilantro" } });
    await screen.findByText("fresh cilantro");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("fresh cilantro");
  });
});
