import { r as __toESM } from "../_runtime.mjs";
import { r as isDemoSession, t as api } from "./api-DOfBQFpN.mjs";
import { n as require_react, r as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { G as redirect, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRouteWithContext, x as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$5 } from "./results-DVcGyxIN.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-ChC6Z6hk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BVcuNVHo.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
/** Deterministic pseudo-random so SSR and client agree. */
function makeFireflies(count) {
	const rand = (seed) => {
		const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
		return x - Math.floor(x);
	};
	return Array.from({ length: count }, (_, i) => ({
		left: `${(rand(i + 1) * 96 + 2).toFixed(1)}%`,
		top: `${(rand(i + 51) * 80 + 5).toFixed(1)}%`,
		size: 2 + Math.round(rand(i + 101) * 3),
		dx: `${(rand(i + 151) * 120 - 60).toFixed(0)}px`,
		dy: `${(rand(i + 201) * -140 - 40).toFixed(0)}px`,
		duration: `${(10 + rand(i + 251) * 14).toFixed(1)}s`,
		delay: `${(rand(i + 301) * -18).toFixed(1)}s`
	}));
}
/**
* Enchanted grove backdrop: layered tree silhouettes plus drifting
* firefly glow dots (pure CSS animation, disabled for reduced motion).
*/
function GroveBackground() {
	const fireflies = (0, import_react.useMemo)(() => makeFireflies(20), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "absolute inset-x-0 bottom-0 w-full",
				viewBox: "0 0 1440 420",
				preserveAspectRatio: "xMidYMax slice",
				style: {
					height: "55vh",
					color: "var(--forest)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					fill: "currentColor",
					opacity: "0.75",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M0 420 V300 L40 300 V240 L70 150 L100 240 V300 L140 300 V260 L170 180 L200 260 V300 L240 300 V420 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M260 420 V310 L300 310 V230 L340 120 L380 230 V310 L420 310 V420 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M900 420 V320 L940 320 V250 L980 140 L1020 250 V320 L1060 320 V420 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1100 420 V300 L1150 300 V220 L1200 90 L1250 220 V300 L1300 300 V260 L1330 190 L1360 260 V300 L1400 300 V420 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M520 420 V330 L550 330 V280 L585 200 L620 280 V330 L650 330 V420 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M700 420 V340 L730 340 V290 L765 210 L800 290 V340 L830 340 V420 Z" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "absolute inset-x-0 bottom-0 w-full",
				viewBox: "0 0 1440 300",
				preserveAspectRatio: "xMidYMax slice",
				style: {
					height: "34vh",
					color: "var(--forest-dark)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					fill: "currentColor",
					opacity: "0.9",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 300 V210 L150 210 V150 L200 40 L250 150 V210 L300 210 V300 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M380 300 V220 L430 220 V170 L480 60 L530 170 V220 L580 220 V300 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M660 300 V215 L705 215 V160 L755 55 L805 160 V215 L850 215 V300 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M940 300 V225 L990 225 V175 L1040 70 L1090 175 V225 L1140 225 V300 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1220 300 V215 L1265 215 V160 L1315 50 L1365 160 V215 L1410 215 V300 Z" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "0",
							y: "288",
							width: "1440",
							height: "12",
							rx: "6"
						})
					]
				})
			}),
			fireflies.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "firefly",
				style: {
					left: f.left,
					top: f.top,
					width: f.size,
					height: f.size,
					"--dx": f.dx,
					"--dy": f.dy,
					"--duration": f.duration,
					"--delay": f.delay
				}
			}, i))
		]
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-10 flex min-h-screen items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-xl font-semibold text-foreground",
					children: "Lost in the grove"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Back to Thyme"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-10 flex min-h-screen items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try again or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$4 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Thyme — Cook what you have." },
			{
				name: "description",
				content: "Thyme helps college students conjure recipes from whatever is already in their kitchen."
			},
			{
				name: "author",
				content: "Thyme"
			},
			{
				property: "og:title",
				content: "Thyme — Cook what you have."
			},
			{
				property: "og:description",
				content: "Enter your pantry, conjure recipes, and gather only what's missing."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function SiteHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "relative z-20 border-b backdrop-blur-sm",
		style: {
			borderColor: "var(--border)",
			background: "var(--forest-dark)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-2xl font-bold",
					style: { color: "var(--gold)" },
					children: "Thyme"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden text-xs text-muted-foreground sm:inline",
					children: "Cook what you have."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					className: "text-foreground/90 transition-colors hover:text-gold",
					activeProps: { className: "text-gold font-medium" },
					children: "Pantry Grove"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "text-foreground/90 transition-colors hover:text-gold",
					activeProps: { className: "text-gold font-medium" },
					children: "Account"
				})]
			})]
		})
	});
}
function RootComponent() {
	const { queryClient } = Route$4.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-screen",
			style: { background: "var(--background)" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroveBackground, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex min-h-screen flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})]
		})
	});
}
var $$splitComponentImporter$3 = () => import("./routes-C8CSq5hk.mjs");
var Route$3 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Thyme — Cook what you have." },
		{
			name: "description",
			content: "Tell Thyme what's in your kitchen and it conjures recipes you can cook tonight — plus a short shopping list when you're just a few things away."
		},
		{
			property: "og:title",
			content: "Thyme — Cook what you have."
		},
		{
			property: "og:description",
			content: "Enter your pantry, conjure recipes, and gather only what's missing."
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
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./route-VMVio82L.mjs");
/**
* Pathless layout gating /search and /results: signed-out visitors are
* redirected to /account. Client-only (ssr: false) because the session
* lives in browser storage.
*/
var Route$2 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		if (isDemoSession()) return;
		try {
			const { user } = await api("/api/auth/session");
			if (user) return;
		} catch (error) {
			console.error(error);
		}
		throw redirect({ to: "/account" });
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./account-CyoZOGFj.mjs");
var Route$1 = createFileRoute("/account")({
	head: () => ({ meta: [
		{ title: "Account — Thyme" },
		{
			name: "description",
			content: "Sign in to Thyme and tell us your restrictions, tastes, and budget."
		},
		{
			property: "og:title",
			content: "Account — Thyme"
		},
		{
			property: "og:description",
			content: "Sign in to Thyme and tell us your restrictions, tastes, and budget."
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
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./search-CsP-_rqe.mjs");
var Route = createFileRoute("/_authenticated/search")({
	head: () => ({ meta: [
		{ title: "Your Pantry Grove — Thyme" },
		{
			name: "description",
			content: "Add the ingredients you already have and conjure recipes from your pantry."
		},
		{
			property: "og:title",
			content: "Your Pantry Grove — Thyme"
		},
		{
			property: "og:description",
			content: "Add the ingredients you already have and conjure recipes from your pantry."
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
var IndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$4
});
var AuthenticatedRouteRoute = Route$2.update({
	id: "/_authenticated",
	getParentRoute: () => Route$4
});
var AccountRoute = Route$1.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$4
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedResultsRoute: Route$5.update({
		id: "/results",
		path: "/results",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSearchRoute: Route.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AccountRoute
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
