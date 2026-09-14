import {
  CheckCircle2,
  Download,
  Hourglass,
  MinusCircle,
  Plus,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { PageHeading } from "@/components/ui/page-heading";
import { SelectField } from "@/components/ui/select-field";
import { StatCard } from "@/components/ui/stat-card";
import { AdminUserDetailDrawer } from "@/features/system-administration/components/admin-user-detail-drawer";
import { AdminUsersFilters } from "@/features/system-administration/components/admin-users-filters";
import { AdminUsersTable } from "@/features/system-administration/components/admin-users-table";
import {
  useAdminCurrentUser,
  useAdminUsers,
} from "@/features/system-administration/hooks/admin-users.hooks";
import { hasAdminAction } from "@/features/system-administration/model/admin-authorization";
import type {
  AdminUserFilters,
  PaginatedAdminUsers,
} from "@/features/system-administration/model/admin-user.types";

const initialFilters: AdminUserFilters = {
  search: "",
  status: "",
  instanceId: "",
  entityId: "",
  groupId: "",
  page: 1,
  pageSize: 24,
};

type UsersViewState =
  "validating-access" | "identity-error" | "forbidden" | "loading-users" | "users-error" | "ready";

function resolveUsersViewState({
  currentUserLoading,
  currentUserError,
  canListUsers,
  usersLoading,
  usersError,
}: {
  currentUserLoading: boolean;
  currentUserError: boolean;
  canListUsers: boolean;
  usersLoading: boolean;
  usersError: boolean;
}): UsersViewState {
  if (currentUserLoading) return "validating-access";
  if (currentUserError) return "identity-error";
  if (!canListUsers) return "forbidden";
  if (usersLoading) return "loading-users";
  if (usersError) return "users-error";
  return "ready";
}

function summaryCards(data?: PaginatedAdminUsers) {
  return [
    {
      title: "Total de usuarios",
      value: data?.summary.total ?? 0,
      detail: "Cuentas visibles según tu alcance",
      icon: Users,
      tone: "brand" as const,
    },
    {
      title: "Usuarios activos",
      value: data?.summary.active ?? 0,
      detail: "Estatus que permite iniciar sesión",
      icon: CheckCircle2,
      tone: "emerald" as const,
    },
    {
      title: "En proceso",
      value: data?.summary.inProcess ?? 0,
      detail: "Estatus 2 de auth_service",
      icon: Hourglass,
      tone: "amber" as const,
    },
    {
      title: "Inactivos",
      value: data?.summary.inactive ?? 0,
      detail: "Incluye cuentas sin estatus",
      icon: MinusCircle,
      tone: "slate" as const,
    },
    {
      title: "Cuentas bloqueadas",
      value: data?.summary.blocked ?? 0,
      detail: "Intentos en exceso de sesión",
      icon: XCircle,
      tone: "red" as const,
    },
  ];
}

function CreateUserAction({
  canCreateAccount,
  canCompleteCreateFlow,
}: {
  canCreateAccount: boolean;
  canCompleteCreateFlow: boolean;
}) {
  if (!canCreateAccount) return null;

  if (!canCompleteCreateFlow) {
    return (
      <Button disabled title="El flujo completo requiere ASIGNAR_ACCIONES_USUARIO.">
        <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo usuario
      </Button>
    );
  }

  return (
    <Button asChild>
      <Link to="/app/usuarios/nuevo">
        <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo usuario
      </Link>
    </Button>
  );
}

function UsersView({
  state,
  users,
  canViewDetail,
  onView,
}: {
  state: UsersViewState;
  users: PaginatedAdminUsers["items"];
  canViewDetail: boolean;
  onView: (id: string | null) => void;
}) {
  const contentByState: Record<UsersViewState, ReactNode> = {
    "validating-access": (
      <div className="rounded-xl border border-[var(--ui-border)] bg-white p-8 text-sm text-slate-500">
        Validando permisos administrativos...
      </div>
    ),
    "identity-error": (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-700">
        No fue posible consultar /users/me. Verifica que la aplicación tenga un access_token
        vigente.
      </div>
    ),
    forbidden: (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
        No cuentas con la acción VER_USUARIOS requerida por el contrato vigente para consultar este
        módulo.
      </div>
    ),
    "loading-users": (
      <div className="rounded-xl border border-[var(--ui-border)] bg-white p-8 text-sm text-slate-500">
        Cargando usuarios...
      </div>
    ),
    "users-error": (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No fue posible consultar el listado vigente de auth_service.
      </div>
    ),
    ready: <AdminUsersTable users={users} onView={onView} canView={canViewDetail} />,
  };

  return contentByState[state];
}

export function AdminUsersListPage() {
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get("user");
  const currentUserQuery = useAdminCurrentUser();
  const canListUsers = hasAdminAction(currentUserQuery.data, "VER_USUARIOS");
  const usersQuery = useAdminUsers(filters, currentUserQuery.isSuccess && canListUsers);
  const data = usersQuery.data;
  const canCreateAccount = hasAdminAction(currentUserQuery.data, "CREAR_USUARIO");
  const canAssignInitialPermissions = hasAdminAction(
    currentUserQuery.data,
    "ASIGNAR_ACCIONES_USUARIO",
  );
  const canCompleteCreateFlow = canCreateAccount && canAssignInitialPermissions;
  const canViewDetail = hasAdminAction(currentUserQuery.data, "VER_USUARIO_DETALLE");
  const viewState = resolveUsersViewState({
    currentUserLoading: currentUserQuery.isLoading,
    currentUserError: currentUserQuery.isError,
    canListUsers,
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.isError,
  });

  const setSelectedUserId = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("user", id);
    else next.delete("user");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          <span>
            Configuración &gt; <span className="text-[var(--ui-primary)]">Usuarios</span>
          </span>
        }
        title="Administración de usuarios"
        description="Consulta, registra y administra cuentas, accesos y permisos con el contrato vigente de auth_service."
        actions={
          <>
            <Button
              variant="secondary"
              disabled={!currentUserQuery.isSuccess || !canListUsers}
              onClick={() => {
                void Promise.all([usersQuery.refetch(), currentUserQuery.refetch()]);
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
            </Button>
            <CreateUserAction
              canCreateAccount={canCreateAccount}
              canCompleteCreateFlow={canCompleteCreateFlow}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards(data).map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value.toLocaleString("es-MX")}
            detail={card.detail}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <AdminUsersFilters
        draft={draftFilters}
        applied={filters}
        options={data?.filterOptions ?? { instances: [], entities: [], groups: [] }}
        onDraftChange={setDraftFilters}
        onApply={(next) => setFilters(next ?? { ...draftFilters, page: 1 })}
        onClear={() => {
          setDraftFilters(initialFilters);
          setFilters(initialFilters);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-[var(--ui-text-primary)]">
            {(data?.totalItems ?? 0).toLocaleString("es-MX")} usuarios encontrados
          </h2>
          <SelectField
            value={String(filters.pageSize)}
            onValueChange={(value) => {
              const pageSize = Number(value);
              setDraftFilters((current) => ({ ...current, pageSize, page: 1 }));
              setFilters((current) => ({ ...current, pageSize, page: 1 }));
            }}
            options={[12, 24, 48].map((value) => ({
              value: String(value),
              label: `${value} por página`,
            }))}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4" aria-hidden="true" /> Exportar vista
        </Button>
      </div>

      <UsersView
        state={viewState}
        users={data?.items ?? []}
        canViewDetail={canViewDetail}
        onView={setSelectedUserId}
      />

      <DataTablePagination
        page={data?.page ?? filters.page}
        totalPages={data?.totalPages ?? 1}
        totalItems={data?.totalItems ?? 0}
        pageSize={filters.pageSize}
        onPageChange={(page) => {
          setFilters((current) => ({ ...current, page }));
          setDraftFilters((current) => ({ ...current, page }));
        }}
      />

      <AdminUserDetailDrawer
        userId={selectedUserId}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
      />
    </div>
  );
}
