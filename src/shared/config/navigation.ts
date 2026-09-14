import {
  History,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavigationChildItem = {
  label: string;
  icon?: LucideIcon;
  to: string;
  requiredAnyAction?: readonly string[];
};

export type NavigationItem = {
  label: string;
  to?: string;
  icon: LucideIcon;
  requiredAnyAction?: readonly string[];
  children?: NavigationChildItem[];
};

export const CONFIGURATION_ADMIN_ACTIONS = [
  "ADMINISTRAR_USUARIOS",
  "VER_USUARIOS",
  "CREAR_USUARIO",
  "ACTUALIZAR_USUARIO",
  "ASIGNAR_GRUPOS_USUARIO",
  "ASIGNAR_MODULOS_USUARIO",
  "ASIGNAR_ACCIONES_USUARIO",
] as const;

export const sidebarNavigation: NavigationItem[] = [
  {
    label: "Resumen",
    to: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Perfiles",
    to: "/app/perfiles",
    icon: UserCog,
    requiredAnyAction: ["VER_USUARIOS"],
  },
  {
    label: "Catálogo de permisos",
    to: "/app/permisos",
    icon: ShieldCheck,
    requiredAnyAction: ["VER_USUARIOS"],
  },
  {
    label: "Usuarios",
    icon: Users,
    requiredAnyAction: ["VER_USUARIOS", "CREAR_USUARIO", "ACTUALIZAR_USUARIO"],
    children: [
      {
        label: "Administrar usuarios",
        icon: UsersRound,
        to: "/app/usuarios",
        requiredAnyAction: ["VER_USUARIOS"],
      },
      {
        label: "Crear usuario",
        icon: UserPlus,
        to: "/app/usuarios/nuevo",
        requiredAnyAction: ["CREAR_USUARIO"],
      },
    ],
  },
  {
    label: "Apariencia",
    to: "/app/apariencia",
    icon: Palette,
    requiredAnyAction: ["ADMINISTRAR_USUARIOS"],
  },
  {
    label: "Historial",
    to: "/app/historial",
    icon: History,
    requiredAnyAction: ["VER_USUARIOS"],
  },
];

type NavigationAccessItem = Pick<NavigationItem | NavigationChildItem, "requiredAnyAction">;

export function canAccessNavigationItem(
  item: NavigationAccessItem,
  permissions: readonly string[],
): boolean {
  if (!item.requiredAnyAction?.length) return true;

  const permissionSet = new Set(permissions.map((permission) => permission.trim().toUpperCase()));

  if (permissionSet.has("SUPER_ADMIN")) return true;

  return item.requiredAnyAction.some((action) => permissionSet.has(action.trim().toUpperCase()));
}

export function getVisibleNavigationChildren(
  item: NavigationItem,
  permissions: readonly string[],
): NavigationChildItem[] {
  return (item.children ?? []).filter((child) => canAccessNavigationItem(child, permissions));
}
