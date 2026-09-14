import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { DeferredRoute } from "@/app/router/deferred-route";
import { RootErrorBoundary } from "@/app/router/root-error-boundary";
import { ConfigurationShell } from "@/components/layout/configuration-shell";
import { AppearanceAccessGuard } from "@/features/appearance-settings/components/appearance-access-guard";
import { ActionAccessGuard } from "@/features/auth/components/action-access-guard";
import { ConfigurationAccessGuard } from "@/features/auth/components/configuration-access-guard";
import { ProtectedAppRoute } from "@/features/auth/components/protected-app-route";

const ConfigurationDashboardPage = lazy(() =>
  import("@/features/configuration-dashboard/pages/configuration-dashboard-page").then(
    (module) => ({
      default: module.ConfigurationDashboardPage,
    }),
  ),
);

const AccessProfilesPage = lazy(() =>
  import("@/features/access-profiles/pages/access-profiles-page").then((module) => ({
    default: module.AccessProfilesPage,
  })),
);

const AccessProfileCreatePage = lazy(() =>
  import("@/features/access-profiles/pages/access-profile-create-page").then((module) => ({
    default: module.AccessProfileCreatePage,
  })),
);

const PermissionCatalogPage = lazy(() =>
  import("@/features/permission-catalog/pages/permission-catalog-page").then((module) => ({
    default: module.PermissionCatalogPage,
  })),
);

const AppearanceSettingsPage = lazy(() =>
  import("@/features/appearance-settings/pages/appearance-settings-page").then((module) => ({
    default: module.AppearanceSettingsPage,
  })),
);

const AdminHistoryPage = lazy(() =>
  import("@/features/system-administration/pages/admin-history-page").then((module) => ({
    default: module.AdminHistoryPage,
  })),
);

const AdminUserCreatePage = lazy(() =>
  import("@/features/system-administration/pages/admin-user-create-page").then((module) => ({
    default: module.AdminUserCreatePage,
  })),
);

const AdminUserEditPage = lazy(() =>
  import("@/features/system-administration/pages/admin-user-edit-page").then((module) => ({
    default: module.AdminUserEditPage,
  })),
);

const AdminUsersListPage = lazy(() =>
  import("@/features/system-administration/pages/admin-users-list-page").then((module) => ({
    default: module.AdminUsersListPage,
  })),
);

const NotFoundPage = lazy(() =>
  import("@/features/placeholders/pages/not-found-page").then((module) => ({
    default: module.NotFoundPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: "app",
        element: (
          <ProtectedAppRoute>
            <ConfigurationAccessGuard>
              <ConfigurationShell />
            </ConfigurationAccessGuard>
          </ProtectedAppRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: (
              <DeferredRoute>
                <ConfigurationDashboardPage />
              </DeferredRoute>
            ),
          },
          {
            path: "perfiles",
            element: (
              <ActionAccessGuard
                action="VER_USUARIOS"
                moduleTitle="Perfiles de acceso"
                moduleDescription="Diseña perfiles reutilizables a partir del catálogo de permisos vigente."
              >
                <DeferredRoute>
                  <AccessProfilesPage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "perfiles/nuevo",
            element: (
              <ActionAccessGuard
                action="VER_USUARIOS"
                moduleTitle="Diseñar perfil"
                moduleDescription="Prepara una definición reutilizable de grupos, módulos y acciones."
              >
                <DeferredRoute>
                  <AccessProfileCreatePage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "permisos",
            element: (
              <ActionAccessGuard
                action="VER_USUARIOS"
                moduleTitle="Catálogo de permisos"
                moduleDescription="Consulta la jerarquía de permisos publicada por auth_service."
              >
                <DeferredRoute>
                  <PermissionCatalogPage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "usuarios",
            element: (
              <ActionAccessGuard action="VER_USUARIOS">
                <DeferredRoute>
                  <AdminUsersListPage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "usuarios/nuevo",
            element: (
              <ActionAccessGuard action="CREAR_USUARIO">
                <DeferredRoute>
                  <AdminUserCreatePage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "usuarios/:userId/editar",
            element: (
              <ActionAccessGuard action="ACTUALIZAR_USUARIO">
                <DeferredRoute>
                  <AdminUserEditPage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
          {
            path: "apariencia",
            element: (
              <AppearanceAccessGuard>
                <DeferredRoute>
                  <AppearanceSettingsPage />
                </DeferredRoute>
              </AppearanceAccessGuard>
            ),
          },
          {
            path: "historial",
            element: (
              <ActionAccessGuard action="VER_USUARIOS">
                <DeferredRoute>
                  <AdminHistoryPage />
                </DeferredRoute>
              </ActionAccessGuard>
            ),
          },
        ],
      },
      {
        path: "*",
        element: (
          <DeferredRoute>
            <NotFoundPage />
          </DeferredRoute>
        ),
      },
    ],
  },
]);
