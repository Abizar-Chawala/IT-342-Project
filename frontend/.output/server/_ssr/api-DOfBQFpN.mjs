//#region node_modules/.nitro/vite/services/ssr/assets/api-DOfBQFpN.js
var DEMO_SESSION_KEY = "thyme-local-demo-session";
function isDemoSession() {
	return false;
}
function startDemoSession() {
	throw new Error("Demo sign-in is only available during local development.");
}
function endDemoSession() {
	if (typeof window !== "undefined") window.localStorage.removeItem(DEMO_SESSION_KEY);
}
async function api(path, init) {
	const response = await fetch(path, {
		...init,
		credentials: "same-origin",
		headers: {
			...init?.body ? { "content-type": "application/json" } : {},
			...isDemoSession() ? { "x-thyme-demo": "true" } : {},
			...init?.headers
		}
	});
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.error ?? `Request failed (${response.status})`);
	}
	return response.json();
}
//#endregion
export { startDemoSession as i, endDemoSession as n, isDemoSession as r, api as t };
