import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C8CSq5hk.js
var import_jsx_runtime = require_jsx_runtime();
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:py-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-5xl",
				"aria-hidden": true,
				children: "🌿"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "fade-up mt-4 font-display text-6xl font-bold sm:text-7xl",
				style: { color: "var(--gold)" },
				children: "Thyme"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "fade-up mt-2 font-display text-xl italic text-foreground/90",
				children: "Cook what you have."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "fade-up mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base",
				children: "Tell the grove what's already in your kitchen, and it will conjure the recipes you can cook tonight — plus a short shopping list for the ones that are just a few things away."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fade-up mt-10 flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					className: "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition-transform hover:scale-[1.02]",
					style: {
						background: "var(--gold)",
						color: "var(--forest-dark)"
					},
					children: "Enter Your Pantry Grove"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent",
					style: {
						borderColor: "var(--input)",
						color: "var(--parchment)"
					},
					children: "Sign in"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-xs text-muted-foreground",
				children: "A hackathon sprout by students, for students."
			})
		]
	});
}
//#endregion
export { Index as component };
