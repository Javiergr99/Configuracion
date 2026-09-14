import { Palette, ShieldCheck, UserCog, Users } from "lucide-react";
import { Link } from "react-router";

import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { userHasAction } from "@/features/auth/model/auth.selectors";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { usePermissionCatalog } from "@/features/system-administration/hooks/admin-users.hooks";

function catalogCounts(catalog: ReturnType<typeof usePermissionCatalog>["data"]) {
  let modules = 0;
  let actions = 0;

  for (const group of catalog ?? []) {
    modules += group.modules.length;

    for (const module of group.modules) {
      actions += module.actions.length;
    }
  }

  return {
    groups: catalog?.length ?? 0,
    modules,
    actions,
  };
}

const modules = [
  {
    title: "Perfiles de acceso",
    description:
      "Prepara perfiles reutilizables sobre el catálogo real; su persistencia central depende del contrato backend pendiente.",
    to: "/app/perfiles",
    icon: UserCog,
  },
  {
    title: "Usuarios",
    description:
      "Administra cuentas, estatus, alcance y permisos efectivos publicados por auth_service.",
    to: "/app/usuarios",
    icon: Users,
  },
  {
    title: "Catálogo de permisos",
    description: "Consulta la jerarquía vigente de sistemas, módulos y acciones disponibles.",
    to: "/app/permisos",
    icon: ShieldCheck,
  },
  {
    title: "Apariencia",
    description:
      "Prepara la identidad visual y los Design Tokens del ecosistema desde un solo lugar.",
    to: "/app/apariencia",
    icon: Palette,
  },
];

export function ConfigurationDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const canViewCatalog = userHasAction(user, "VER_USUARIOS");
  const catalogQuery = usePermissionCatalog(canViewCatalog);
  const counts = catalogCounts(catalogQuery.data);

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          <>
            <span>Configuración</span>
            <span className="px-1">›</span>
            <span className="text-[var(--ui-primary)]">Resumen</span>
          </>
        }
        title="Centro de configuración"
        description="Administra los accesos, perfiles y parámetros transversales del Ecosistema Integral DGCP."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Sistemas / grupos"
          value={canViewCatalog && catalogQuery.isSuccess ? String(counts.groups) : "—"}
          detail="Catálogo publicado por auth_service"
          icon={ShieldCheck}
          tone="brand"
        />
        <StatCard
          title="Módulos"
          value={canViewCatalog && catalogQuery.isSuccess ? String(counts.modules) : "—"}
          detail="Módulos administrables"
          icon={Users}
          tone="amber"
        />
        <StatCard
          title="Acciones"
          value={canViewCatalog && catalogQuery.isSuccess ? String(counts.actions) : "—"}
          detail="Permisos funcionales vigentes"
          icon={UserCog}
          tone="brand"
        />
        <StatCard
          title="Perfiles persistidos"
          value="—"
          detail="Pendiente de contrato backend"
          icon={Palette}
          tone="amber"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--ui-border)] px-5 py-4">
          <h2 className="text-base font-bold text-[var(--ui-text-primary)]">
            Administración del ecosistema
          </h2>
          <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
            Este módulo centraliza identidad, usuarios y autorización sin duplicar la operación de
            los sistemas que administra.
          </p>
        </div>

        <div className="grid gap-px bg-[var(--ui-border)] md:grid-cols-2">
          {modules.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="group bg-white p-5 transition-colors hover:bg-slate-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-[var(--ui-primary)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-[var(--ui-text-primary)] group-hover:text-[var(--ui-primary)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ui-text-secondary)]">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </Card>

      {canViewCatalog && catalogQuery.isError ? (
        <Card className="border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            No fue posible consultar el catálogo de permisos de auth_service.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
