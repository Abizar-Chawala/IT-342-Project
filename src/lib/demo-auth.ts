const DEMO_SESSION_KEY = "thyme-local-demo-session";

export function isDemoSession(): boolean {
  return (
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(DEMO_SESSION_KEY) === "active"
  );
}

export function startDemoSession(): void {
  if (!import.meta.env.DEV) {
    throw new Error("Demo sign-in is only available during local development.");
  }
  window.localStorage.setItem(DEMO_SESSION_KEY, "active");
}

export function endDemoSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
  }
}
