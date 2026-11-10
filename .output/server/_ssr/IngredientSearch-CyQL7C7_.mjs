import { r as __toESM } from "../_runtime.mjs";
import { t as api } from "./api-DOfBQFpN.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/IngredientSearch-CyQL7C7_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Pantry ingredient search bar with ranked autocomplete, keyboard support
* (arrows, Enter, Escape), tap/click, removable chips, and custom entries.
*/
function IngredientSearch({ selected, onAdd, onRemove, allowCustom = true, placeholder = "Search your pantry — try “rice” or “green onion”", ariaLabel = "Search ingredients", inputId }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [highlight, setHighlight] = (0, import_react.useState)(0);
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const [ambiguous, setAmbiguous] = (0, import_react.useState)(false);
	const boxRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const trimmed = query.trim();
		if (!trimmed) {
			setSuggestions([]);
			setAmbiguous(false);
			return;
		}
		let active = true;
		const params = new URLSearchParams({
			q: trimmed,
			exclude: selected.join(",")
		});
		api(`/api/pantry?${params}`).then(({ suggestions: next, ambiguous: isAmbiguous }) => {
			if (active) {
				setSuggestions(next);
				setAmbiguous(isAmbiguous);
			}
		}).catch((error) => {
			console.error(error);
			if (active) {
				setSuggestions([]);
				setAmbiguous(false);
			}
		});
		return () => {
			active = false;
		};
	}, [query, selected]);
	const showNoMatch = allowCustom && query.trim().length > 0 && suggestions.length === 0;
	const showRequiredSuggestion = !allowCustom && query.trim().length > 0 && suggestions.length === 0;
	const items = suggestions;
	(0, import_react.useEffect)(() => {
		function onDocClick(e) {
			if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);
	const addCanonical = (name) => {
		onAdd(name);
		setQuery("");
		setOpen(false);
		setHighlight(0);
	};
	const addCustom = () => {
		const text = query.trim();
		if (!text) return;
		onAdd(text);
		setQuery("");
		setOpen(false);
		setHighlight(0);
	};
	function onKeyDown(e) {
		if (!open) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") setOpen(true);
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight((h) => Math.min(h + 1, items.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight((h) => Math.max(h - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const picked = items[highlight];
			if (allowCustom && ambiguous) addCanonical(query.trim());
			else if (picked) addCanonical(picked.name);
			else if (allowCustom) addCustom();
		} else if (e.key === "Escape") setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: boxRef,
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: inputId,
				value: query,
				onChange: (e) => {
					setQuery(e.target.value);
					setOpen(true);
					setHighlight(0);
				},
				onFocus: () => setOpen(true),
				onKeyDown,
				placeholder,
				"aria-label": ariaLabel,
				autoComplete: "off",
				className: "w-full rounded-xl border px-4 py-3 text-base text-ink outline-none placeholder:text-ink/40 focus:ring-2",
				style: {
					background: "var(--parchment)",
					borderColor: "var(--parchment-dark)"
				}
			}),
			open && query.trim().length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				role: "listbox",
				"aria-label": "Ingredient suggestions",
				className: "absolute z-20 mt-1 w-full overflow-hidden rounded-xl border shadow-lg",
				style: {
					background: "var(--parchment)",
					borderColor: "var(--parchment-dark)"
				},
				children: [
					items.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						role: "option",
						"aria-selected": i === highlight,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onMouseEnter: () => setHighlight(i),
							onClick: () => addCanonical(s.name),
							className: "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-ink",
							style: { background: i === highlight ? "var(--gold-soft)" : "transparent" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: s.name
							}), s.alias && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-ink/60",
								children: [
									s.alias,
									" → ",
									s.name
								]
							})]
						})
					}, s.name)),
					showNoMatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addCustom,
						className: "w-full px-4 py-2.5 text-left text-sm text-ink/70",
						children: [
							"No match. Press Enter to add “",
							query.trim(),
							"” anyway"
						]
					}) }),
					showRequiredSuggestion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-4 py-2.5 text-sm text-ink/70",
						children: "No matching catalog ingredient. Try another search."
					})
				]
			}),
			selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: selected.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-ink",
					style: {
						background: "var(--gold-soft)",
						border: "1px solid var(--gold)"
					},
					children: [chip, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Remove ${chip}`,
						onClick: () => onRemove(chip),
						className: "text-ink/60 hover:text-ink",
						children: "×"
					})]
				}, chip))
			})
		]
	});
}
//#endregion
export { IngredientSearch as t };
