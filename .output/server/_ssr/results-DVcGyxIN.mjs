import { _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-DVcGyxIN.js
var $$splitComponentImporter = () => import("./results-DTktoi61.mjs");
var Route = createFileRoute("/_authenticated/results")({
	validateSearch: (search) => {
		const rawPantry = search["p"];
		let pantry = [];
		if (Array.isArray(rawPantry)) pantry = rawPantry.map(String);
		else try {
			const parsed = JSON.parse(String(rawPantry ?? "[]"));
			if (Array.isArray(parsed)) pantry = parsed.map(String);
		} catch {
			pantry = [];
		}
		const requestedServings = Number(search["s"]);
		return {
			p: pantry,
			s: Number.isFinite(requestedServings) && requestedServings >= 1 ? Math.min(12, Math.trunc(requestedServings)) : 2
		};
	},
	head: () => ({ meta: [
		{ title: "Conjured Recipes — Thyme" },
		{
			name: "description",
			content: "Recipes you can cook right now, and the ones that are just a few things away."
		},
		{
			property: "og:title",
			content: "Conjured Recipes — Thyme"
		},
		{
			property: "og:description",
			content: "Recipes you can cook right now, and the ones that are just a few things away."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
