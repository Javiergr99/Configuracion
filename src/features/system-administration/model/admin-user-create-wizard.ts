import { z } from "zod";

export const createUserIdentitySchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa el nombre."),
  firstSurname: z.string().trim().min(2, "Ingresa el primer apellido."),
  secondSurname: z.string().trim().optional(),
  curp: z.string().trim().toUpperCase().length(18, "La CURP debe tener exactamente 18 caracteres."),
  email: z.email("Ingresa un correo electrónico válido."),
  phone: z.string().trim().max(15, "El teléfono admite máximo 15 caracteres.").optional(),
});

export const createUserScopeSchema = z.object({
  entityId: z.string().trim().regex(/^\d+$/, "Selecciona una entidad federativa."),
  instanceId: z.string().trim().regex(/^\d+$/, "Selecciona una instancia."),
  statusId: z
    .string()
    .trim()
    .regex(/^[1-4]$/, "Selecciona un estatus inicial."),
  profileLabel: z.string().trim().min(1, "Selecciona un perfil descriptivo."),
});

export const createUserWizardSchema = createUserIdentitySchema.merge(createUserScopeSchema);

export type CreateUserWizardValues = z.infer<typeof createUserWizardSchema>;

export const CREATE_USER_PROFILE_OPTIONS = [
  { value: "Capturista", label: "Capturista" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Administrador", label: "Administrador" },
  { value: "Consulta / auditoría", label: "Consulta / auditoría" },
] as const;

export const CREATE_USER_STATUS_OPTIONS = [
  { value: "2", label: "Pendiente de activación" },
  { value: "1", label: "Activo" },
  { value: "3", label: "Inactivo" },
  { value: "4", label: "Bloqueado" },
] as const;
