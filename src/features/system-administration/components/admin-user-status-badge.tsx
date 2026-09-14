import { StatusDotBadge } from "@/components/ui/status-dot-badge";
import type { AdminUserStatus } from "@/features/system-administration/model/admin-user.types";

const configuration: Record<
  AdminUserStatus,
  { label: string; tone: "success" | "info" | "neutral" | "warning" | "danger" }
> = {
  ACTIVO: { label: "Activo", tone: "success" },
  EN_PROCESO: { label: "En proceso", tone: "info" },
  INACTIVO: { label: "Inactivo", tone: "neutral" },
  BLOQUEADO: { label: "Bloqueado", tone: "danger" },
  SIN_ESTATUS: { label: "Sin estatus", tone: "warning" },
};

export function AdminUserStatusBadge({ status }: { status: AdminUserStatus }) {
  const item = configuration[status];
  return <StatusDotBadge tone={item.tone}>{item.label}</StatusDotBadge>;
}
