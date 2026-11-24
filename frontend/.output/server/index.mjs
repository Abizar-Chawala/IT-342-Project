globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { i as toEventHandler, n as defineHandler, o as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-11-24T15:19:05.626Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/index-BgRWLEw4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54702-7eseC7I/vV4SgRKB53crHz7d5r0\"",
		"mtime": "2026-11-24T15:30:46.231Z",
		"size": 345858,
		"path": "../public/assets/index-BgRWLEw4.js"
	},
	"/assets/account-RbEoAzKU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c96-xM/OCH0xShKNr2+9cmUnZ3CnTJk\"",
		"mtime": "2026-11-24T15:30:46.232Z",
		"size": 11414,
		"path": "../public/assets/account-RbEoAzKU.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-11-24T15:19:05.626Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/assets/api-Dpx6dwcc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d4-zeiVIXAfM48UBUMZP9oEbS352vU\"",
		"mtime": "2026-11-24T15:30:46.232Z",
		"size": 724,
		"path": "../public/assets/api-Dpx6dwcc.js"
	},
	"/assets/IngredientSearch-DhB3JtMl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d84-z5g8JoCHS+RGu5hjSLraNfNy+p8\"",
		"mtime": "2026-11-24T15:30:46.231Z",
		"size": 3460,
		"path": "../public/assets/IngredientSearch-DhB3JtMl.js"
	},
	"/assets/LanternLoader-DhHdHwMk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20f-FjtzvQvVOzMGBIt6Oxowv5Foglg\"",
		"mtime": "2026-11-24T15:30:46.232Z",
		"size": 527,
		"path": "../public/assets/LanternLoader-DhHdHwMk.js"
	},
	"/assets/link-BU7iyWeQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"241d-wiae0NNAb7+005g/e5EMzjUb4wo\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 9245,
		"path": "../public/assets/link-BU7iyWeQ.js"
	},
	"/assets/matchContext-DjGh9hei.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a0-aPM/gYAemVSaGQ/vCQY8EqX3SLM\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 160,
		"path": "../public/assets/matchContext-DjGh9hei.js"
	},
	"/assets/Match-xpK1o29I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117c-BqTm17rTqsk+ceSOLiyXNzPH8KU\"",
		"mtime": "2026-11-24T15:30:46.232Z",
		"size": 4476,
		"path": "../public/assets/Match-xpK1o29I.js"
	},
	"/assets/results-DwsWDAos.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2230-7vie4E57se0Keu6oTfZmdhIVXK0\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 8752,
		"path": "../public/assets/results-DwsWDAos.js"
	},
	"/assets/results-DtB7719O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a53-/Ut1ZxsjN3IlX44MJmwdXbkPN1Q\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 6739,
		"path": "../public/assets/results-DtB7719O.js"
	},
	"/assets/routes-PLOlFmt8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-OTLHKnSySUoBx0d+rDrzbX6yDww\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 1596,
		"path": "../public/assets/routes-PLOlFmt8.js"
	},
	"/assets/route-BNtnlV4a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b-5sv/lIVnsvcJ94sNM7ZG0YcFYKM\"",
		"mtime": "2026-11-24T15:30:46.233Z",
		"size": 139,
		"path": "../public/assets/route-BNtnlV4a.js"
	},
	"/assets/search-OGj8tDAE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c84-lY5E378f2cXQZBs+BR6DqIdKBNk\"",
		"mtime": "2026-11-24T15:30:46.234Z",
		"size": 3204,
		"path": "../public/assets/search-OGj8tDAE.js"
	},
	"/assets/styles-DL-0CYQs.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"515e-tdx0DYQ6flMKpAdyY5Wac4qS/p0\"",
		"mtime": "2026-11-24T15:30:46.234Z",
		"size": 20830,
		"path": "../public/assets/styles-DL-0CYQs.css"
	},
	"/assets/useRouter-jReI_Skg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"229c-36sVB4uTGvSd1pXko2MAM7Rg04w\"",
		"mtime": "2026-11-24T15:30:46.234Z",
		"size": 8860,
		"path": "../public/assets/useRouter-jReI_Skg.js"
	},
	"/assets/useSelector-ClTGh0tt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"832-UJMrWfUCaHN6Hq55gYVhkjg/1HY\"",
		"mtime": "2026-11-24T15:30:46.234Z",
		"size": 2098,
		"path": "../public/assets/useSelector-ClTGh0tt.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_YUCiFF = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_YUCiFF
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
