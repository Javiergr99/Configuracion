import { useEffect, useMemo } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";

import { ConfigurationHeader } from "@/components/layout/configuration-header";
import { ConfigurationSidebar } from "@/components/layout/configuration-sidebar";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { getSessionActionNames } from "@/features/auth/services/jwt-actions";

export function ConfigurationShell() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const permissions = useMemo(() => getSessionActionNames(user), [user]);

  useEffect(() => {
    document.getElementById("app-scroll-container")?.scrollTo({
      top: 0,
      left: 0,
    });
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-canvas" data-sidebar-expanded="true">
      <ConfigurationHeader />
      <ConfigurationSidebar permissions={permissions} />

      <main
        id="app-scroll-container"
        className="app-scrollbar absolute bottom-0 left-[var(--sidebar-current-width)] right-0 top-[var(--header-height)] min-w-0 overflow-x-hidden overflow-y-auto"
      >
        <div className="app-content-shell min-h-full min-w-0">
          <Outlet />
        </div>
      </main>

      <ScrollRestoration />
    </div>
  );
}
