import type { ApiError } from "@/features/system-administration/api/admin-users.contracts";

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors?: unknown[];
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, payload?: Partial<ApiError> | null) {
    super(payload?.detail || `Error de administración (${status}).`);
    this.name = "AdminApiError";
    this.status = status;
    this.code = payload?.code || `HTTP_${status}`;
    this.errors = payload?.errors;
    this.fieldErrors = payload?.field_errors;
  }
}

export function getAdminErrorMessage(
  error: unknown,
  fallback = "No fue posible completar la operación.",
): string {
  return error instanceof AdminApiError ? error.message : fallback;
}
