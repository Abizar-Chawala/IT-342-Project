import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { isDemoSession } from "@/lib/demo-auth";

/**
 * Pathless layout gating /search and /results: signed-out visitors are
 * redirected to /account. Client-only (ssr: false) because the session
 * lives in browser storage.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isDemoSession()) return;

    try {
      const { user } = await api<{ user: { id: string } | null }>("/api/auth/session");
      if (user) return;
    } catch (error) {
      console.error(error);
    }
    {
      throw redirect({ to: "/account" });
    }
  },
  component: () => <Outlet />,
});
