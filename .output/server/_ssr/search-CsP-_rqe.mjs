import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as LanternLoader } from "./LanternLoader-iKRSqvr0.mjs";
import { t as IngredientSearch } from "./IngredientSearch-CyQL7C7_.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-CsP-_rqe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAMPLE_PANTRY = [
	"rice",
	"pasta",
	"egg",
	"onion",
	"garlic",
	"canned tomatoes",
	"cheddar cheese",
	"parmesan cheese",
	"butter",
	"milk",
	"frozen peas",
	"bread",
	"all-purpose flour",
	"sugar",
	"brown sugar",
	"baking powder",
	"lemon",
	"potato",
	"carrot",
	"soy sauce",
	"chicken breast",
	"black beans",
	"tortilla"
];
function SearchPage() {
	const navigate = useNavigate();
	const [chips, setChips] = (0, import_react.useState)([]);
	const [servings, setServings] = (0, import_react.useState)(2);
	const [conjuring, setConjuring] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	function addChip(name) {
		setChips((prev) => prev.includes(name) ? prev : [...prev, name]);
	}
	function removeChip(name) {
		setChips((prev) => prev.filter((c) => c !== name));
	}
	async function conjure() {
		if (chips.length === 0) return;
		setConjuring(true);
		setError(null);
		try {
			await navigate({
				to: "/results",
				search: {
					p: chips,
					s: servings
				}
			});
		} catch (e) {
			console.error(e);
			setError("Something went wrong opening your recipes. Try again.");
			setConjuring(false);
		}
	}
	if (conjuring) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternLoader, { label: "Consulting the grove…" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-bold",
				style: { color: "var(--gold)" },
				children: "Your Pantry Grove"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Add what you already have. The grove will do the rest."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-2xl p-5 shadow-lg sm:p-6",
				style: {
					background: "var(--card)",
					color: "var(--card-foreground)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "servings",
						className: "text-sm font-medium",
						children: "Serving size"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "servings",
						type: "number",
						min: 1,
						max: 12,
						step: 1,
						value: servings,
						onChange: (e) => {
							const requested = Number(e.target.value);
							setServings(Number.isFinite(requested) ? Math.max(1, Math.min(12, Math.trunc(requested))) : 1);
						},
						className: "mt-1 w-28 rounded-lg border px-3 py-2 text-base text-ink outline-none focus:ring-2",
						style: {
							background: "var(--parchment)",
							borderColor: "var(--parchment-dark)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-medium",
							children: "What's in your kitchen?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IngredientSearch, {
								selected: chips,
								onAdd: addChip,
								onRemove: removeChip
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: conjure,
							disabled: chips.length === 0,
							className: "inline-flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50",
							style: {
								background: "var(--gold)",
								color: "var(--forest-dark)"
							},
							children: "✨ Conjure Recipes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setChips((prev) => [.../* @__PURE__ */ new Set([...prev, ...SAMPLE_PANTRY])]),
							className: "inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent",
							style: {
								borderColor: "var(--input)",
								color: "var(--card-foreground)"
							},
							children: "Try a sample pantry"
						})]
					}),
					chips.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-ink/50",
						children: "Add at least one ingredient to conjure."
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 rounded-lg px-4 py-3 text-sm",
						style: {
							background: "var(--destructive)",
							color: "var(--destructive-foreground)"
						},
						children: error
					})
				]
			})
		]
	});
}
//#endregion
export { SearchPage as component };
