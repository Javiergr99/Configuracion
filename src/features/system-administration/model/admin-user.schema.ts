import { z } from "zod";

const baseIdentityFields = {
  firstName: z.string().trim().min(2, "Ingresa el nombre."),
  firstSurname: z.string().trim().min(2, "Ingresa el primer apellido."),
  secondSurname: z.string().trim().optional(),
  curp: z.string().trim().toUpperCase().length(18, "La CURP debe tener exactamente 18 caracteres."),
  email: z.email("Ingresa un correo electrónico válido."),
  phone: z.string().trim().max(15, "El teléfono admite máximo 15 caracteres.").optional(),
};

export const createAdminUserSchema = z.object({
  ...baseIdentityFields,
  instanceId: z.string().trim().optional(),
  entityId: z.string().trim().regex(/^\d+$/, "Ingresa el ID numérico de la entidad."),
  statusId: z
    .string()
    .trim()
    .regex(/^[1-4]$/, "Selecciona un estatus vigente."),
  groupId: z.string().min(1, "Selecciona un grupo inicial."),
});

export const updateAdminUserSchema = z.object({
  ...baseIdentityFields,
  instanceId: z.string().trim().optional(),
  entityId: z.string().trim().optional(),
});

export type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserFormValues = z.infer<typeof updateAdminUserSchema>;
