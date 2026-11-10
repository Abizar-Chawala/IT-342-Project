import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LanternLoader-iKRSqvr0.js
var import_jsx_runtime = require_jsx_runtime();
/** Five lanterns that light up one by one while results are prepared. */
function LanternLoader({ label = "Gathering…" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-16",
		role: "status",
		"aria-label": label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-end gap-3",
			children: [
				0,
				1,
				2,
				3,
				4
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "lantern block h-8 w-6 rounded-md",
				style: {
					background: "var(--gold)",
					"--delay": `${(i * .18).toFixed(2)}s`
				}
			}, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			style: { color: "var(--muted-foreground)" },
			children: label
		})]
	});
}
//#endregion
export { LanternLoader as t };
