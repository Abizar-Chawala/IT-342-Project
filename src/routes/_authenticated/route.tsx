import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
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

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/account" });
    }
  },
  component: () => <Outlet />,
});
