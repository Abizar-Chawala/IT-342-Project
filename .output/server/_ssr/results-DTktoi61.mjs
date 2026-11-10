import { r as __toESM } from "../_runtime.mjs";
import { t as api } from "./api-DOfBQFpN.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as LanternLoader } from "./LanternLoader-iKRSqvr0.mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./results-DVcGyxIN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-DTktoi61.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Parchment-leaf recipe card with owned/missing ingredients and expandable steps. */
function RecipeCard({ tier, budget }) {
	const { recipe } = tier;
	const fitsBudget = budget != null && tier.need.length > 0 && tier.estimated_cost <= budget;
	const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "fade-up rounded-2xl p-5 shadow-md",
		style: {
			background: "var(--card)",
			color: "var(--card-foreground)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl font-semibold leading-tight",
					children: recipe.title
				}), fitsBudget && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full px-3 py-1 text-xs font-semibold",
					style: {
						background: "var(--moss)",
						color: "var(--parchment)"
					},
					children: "fits your budget"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs uppercase tracking-wide text-ink/50",
				children: [
					recipe.category,
					" · ",
					recipe.cuisine,
					" · ",
					totalTime,
					" min (",
					recipe.prep_time_minutes,
					" prep +",
					" ",
					recipe.cook_time_minutes,
					" cook) · ",
					recipe.difficulty
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1.5 text-sm",
				children: tier.items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "mt-0.5 shrink-0 font-medium",
						style: { color: item.owned ? "var(--moss)" : "var(--gold)" },
						children: item.owned ? "✓" : "+"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: item.owned ? "text-ink/70" : "font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded px-1",
							style: item.owned ? void 0 : {
								background: "var(--gold-soft)",
								outline: "1px solid var(--gold)"
							},
							children: item.raw
						})
					})]
				}, `${item.raw}-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm font-medium",
				children: tier.need.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: { color: "var(--moss)" },
					children: "You have everything you need."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Missing ",
					tier.need.length,
					" item",
					tier.need.length === 1 ? "" : "s",
					" · est. $",
					tier.estimated_cost.toFixed(2)
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer text-sm font-semibold",
					style: { color: "var(--moss)" },
					children: "Show instructions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/80",
					children: recipe.instructions.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, i))
				})]
			})
		]
	});
}
/** The combined, deduplicated shopping list across the recipes shown. */
function GatherPanel({ items, total }) {
	if (items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "fade-up rounded-2xl p-5 shadow-md",
		style: {
			background: "var(--card)",
			color: "var(--card-foreground)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl font-semibold",
				children: "Gather"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-ink/50",
				children: "Everything missing across the recipes shown, deduplicated. Prices are estimates."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1.5 text-sm",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-ink/60",
						children: ["est. ", item.est_price > 0 ? `$${item.est_price.toFixed(2)}` : "—"]
					})]
				}, item.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 border-t pt-3 text-sm font-semibold",
				style: { borderColor: "var(--parchment-dark)" },
				children: ["Total est. $", total.toFixed(2)]
			})
		]
	});
}
function ResultsPage() {
	const { p: pantry, s: servings } = Route.useSearch();
	const navigate = useNavigate();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [results, setResults] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const response = await api("/api/recipes", {
					method: "POST",
					body: JSON.stringify({
						pantry,
						servings
					})
				});
				if (cancelled) return;
				setProfile(response.profile);
				setResults(response.results);
			} catch (e) {
				console.error(e);
				if (!cancelled) setError(e instanceof Error ? e.message : "The grove couldn't reach your recipes. Check your connection and try again.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [pantry, servings]);
	if (pantry.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		message: "Your pantry was empty when the grove looked. Add a few ingredients first.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => navigate({ to: "/search" }),
			className: "rounded-xl px-5 py-2.5 text-sm font-semibold",
			style: {
				background: "var(--gold)",
				color: "var(--forest-dark)"
			},
			children: "Back to Your Pantry Grove"
		})
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternLoader, { label: "Consulting the grove…" })
	});
	if (error || !results) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		message: error ?? "Something went wrong conjuring your recipes.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => window.location.reload(),
			className: "rounded-xl px-5 py-2.5 text-sm font-semibold",
			style: {
				background: "var(--gold)",
				color: "var(--forest-dark)"
			},
			children: "Try again"
		})
	});
	const nothingEmpty = results.nothingToBuy.length === 0;
	const fewEmpty = results.justAFewThings.length === 0;
	const bothEmpty = nothingEmpty && fewEmpty;
	const activeTab = tab ?? (nothingEmpty ? "few" : "nothing");
	const shownItems = activeTab === "nothing" ? results.nothingToBuy : results.justAFewThings;
	const budgetBlocked = results.fewEmptyReason === "budget";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-bold",
					style: { color: "var(--gold)" },
					children: "Conjured Recipes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					className: "text-sm underline",
					style: { color: "var(--muted-foreground)" },
					children: "Edit pantry"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					pantry.length,
					" ingredient",
					pantry.length === 1 ? "" : "s",
					" in your pantry · serves",
					" ",
					servings
				]
			}),
			bothEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-2xl p-6 text-center shadow-md",
				style: {
					background: "var(--card)",
					color: "var(--card-foreground)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl",
					children: results.closestMatches.length > 0 ? "Your pantry matches these recipes" : "The grove came back empty-handed."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink/70",
					children: results.closestMatches.length > 0 && !budgetBlocked ? "These recipes use ingredients you have, but need more items before you can make them." : budgetBlocked ? "Some recipes are only a few items away, but they cost more than your budget. Raise your budget in your account settings, or add more ingredients." : results.fewEmptyReason === "no-matches" ? "No recipes match your pantry and saved restrictions. Try adding different ingredients or reviewing your account settings." : "Every recipe that matches your pantry still needs more than 3 extra items. Try adding more ingredients to your pantry."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-2",
					role: "tablist",
					"aria-label": "Recipe tiers",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: activeTab === "nothing",
						onClick: () => setTab("nothing"),
						label: `Nothing to Buy (${results.nothingToBuy.length})`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: activeTab === "few",
						onClick: () => setTab("few"),
						label: `Just a Few Things (${results.justAFewThings.length})`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-4",
					children: shownItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl p-6 text-center text-sm",
						style: {
							background: "var(--card)",
							color: "var(--card-foreground)"
						},
						children: activeTab === "nothing" ? "No recipe uses only what you have yet — check the other tab." : budgetBlocked ? "Recipes a few items away exist, but they cost more than your budget — raise it in your account settings." : results.nothingToBuy.length > 0 ? "No additional recipes are in the few-items tier. Try adding more ingredients to your pantry." : "Every recipe that matches your pantry still needs more than 3 extra items — try adding more ingredients."
					}) : shownItems.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeCard, {
						tier,
						budget: profile?.budget ?? null
					}, tier.recipe.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GatherPanel, {
						items: results.shoppingList,
						total: results.shoppingTotal
					})
				})
			] }),
			results.closestMatches.length > 0 && shownItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						style: { color: "var(--parchment)" },
						children: "Recipes to gather more ingredients for"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "These recipes use at least one ingredient from your pantry. Their cards show what's missing and include the instructions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: results.closestMatches.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [m.reasons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs text-muted-foreground",
							children: m.reasons.join(" · ")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeCard, {
							tier: m.tier,
							budget: profile?.budget ?? null
						})] }, m.recipe.id))
					})
				]
			})
		]
	});
}
function TabButton({ active, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "tab",
		"aria-selected": active,
		onClick,
		className: "rounded-full px-4 py-2 text-sm font-medium transition-colors",
		style: active ? {
			background: "var(--gold)",
			color: "var(--forest-dark)"
		} : {
			background: "var(--muted)",
			color: "var(--foreground)"
		},
		children: label
	});
}
function EmptyState({ message, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-4xl",
				"aria-hidden": true,
				children: "🍃"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: action
			})
		]
	});
}
//#endregion
export { ResultsPage as component };
