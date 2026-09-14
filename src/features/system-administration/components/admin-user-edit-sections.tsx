import { AlertTriangle } from "lucide-react";
import type { ChangeEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/ui/page-heading";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { AdminUserStatusBadge } from "@/features/system-administration/components/admin-user-status-badge";
import { formatAdminUserDate } from "@/features/system-administration/model/admin-user-edit";
import type { UpdateAdminUserFormValues } from "@/features/system-administration/model/admin-user.schema";
import {
  ADMIN_STATUS_CATALOG,
  type AdminSelectOption,
  type AdminUser,
} from "@/features/system-administration/model/admin-user.types";
import { FEDERAL_ENTITY_CATALOG } from "@/shared/catalogs/federal-entities";

const ENTITY_OPTIONS: AdminSelectOption[] = FEDERAL_ENTITY_CATALOG.map((entity) => ({
  value: String(entity.id),
  label: entity.label,
}));

const STATUS_OPTIONS: AdminSelectOption[] = ADMIN_STATUS_CATALOG.map((item) => ({
  value: String(item.id),
  label: item.name,
}));

export type AdminUserEditFormProps = {
  user: AdminUser;
  form: UseFormReturn<UpdateAdminUserFormValues>;
  statusId: string;
  reason: string;
  reasonError: string;
  instanceOptions: AdminSelectOption[];
  busy: boolean;
  onStatusChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: ReturnType<UseFormReturn<UpdateAdminUserFormValues>["handleSubmit"]>;
};

function InfoValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--ui-text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--ui-text-primary)]">{value}</dd>
    </div>
  );
}

export function AdminUserEditLoading() {
  return (
    <div className="rounded-xl border border-[var(--ui-border)] bg-white p-8 text-sm text-slate-500">
      Cargando usuario...
    </div>
  );
}

export function AdminUserEditUnavailable() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      No fue posible cargar el usuario solicitado.
    </div>
  );
}

export function AdminUserEditProtected({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
      {message}
    </div>
  );
}

function AdminUserIdentityCard({ user }: { user: AdminUser }) {
  const initials = `${user.firstName.charAt(0)}${user.firstSurname.charAt(0)}`.toUpperCase();

  return (
    <section className="flex items-center gap-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-5 py-4 shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[var(--ui-primary)]">
        {initials}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-bold text-[var(--ui-text-primary)]">
            {user.fullName}
          </h2>
          <AdminUserStatusBadge status={user.status} />
        </div>
        <p className="mt-0.5 text-xs text-[var(--ui-text-secondary)]">CURP: {user.curp}</p>
      </div>
    </section>
  );
}

function AdminUserTextFields({ form }: { form: UseFormReturn<UpdateAdminUserFormValues> }) {
  return (
    <>
      <Input
        id="edit-first-name-page"
        label="Nombre(s) *"
        {...form.register("firstName")}
        error={form.formState.errors.firstName?.message}
      />
      <Input
        id="edit-first-surname-page"
        label="Primer apellido *"
        {...form.register("firstSurname")}
        error={form.formState.errors.firstSurname?.message}
      />
      <Input
        id="edit-second-surname-page"
        label="Segundo apellido"
        {...form.register("secondSurname")}
        error={form.formState.errors.secondSurname?.message}
      />
      <Input
        id="edit-email-page"
        type="email"
        label="Correo electrónico institucional *"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <Input
        id="edit-phone-page"
        label="Teléfono de contacto"
        {...form.register("phone")}
        error={form.formState.errors.phone?.message}
      />
      <Input
        id="edit-curp-page"
        label="CURP *"
        maxLength={18}
        className="uppercase"
        {...form.register("curp", {
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.toUpperCase();
          },
        })}
        error={form.formState.errors.curp?.message}
      />
    </>
  );
}

function AdminUserSelectFields({
  form,
  statusId,
  instanceOptions,
  onStatusChange,
}: Pick<AdminUserEditFormProps, "form" | "statusId" | "instanceOptions" | "onStatusChange">) {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-2 xl:col-span-3">
        <SelectField
          label="Entidad federativa *"
          value={form.watch("entityId") ?? ""}
          onValueChange={(value) =>
            form.setValue("entityId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          options={ENTITY_OPTIONS}
          error={form.formState.errors.entityId?.message}
        />
        <SelectField
          label="Instancia *"
          value={form.watch("instanceId") ?? ""}
          onValueChange={(value) =>
            form.setValue("instanceId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          options={instanceOptions}
          error={form.formState.errors.instanceId?.message}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-3">
        <SelectField
          label="Estatus del usuario *"
          value={statusId}
          onValueChange={onStatusChange}
          options={STATUS_OPTIONS}
        />
      </div>
    </>
  );
}

function AdminUserGeneralFields({
  form,
  statusId,
  instanceOptions,
  onStatusChange,
}: Pick<AdminUserEditFormProps, "form" | "statusId" | "instanceOptions" | "onStatusChange">) {
  return (
    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-6 py-6 shadow-sm">
      <h2 className="text-base font-bold text-[var(--ui-text-primary)]">Datos generales</h2>
      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminUserTextFields form={form} />
        <AdminUserSelectFields
          form={form}
          statusId={statusId}
          instanceOptions={instanceOptions}
          onStatusChange={onStatusChange}
        />
      </div>

      <div className="mt-4 flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Cambiar el estatus del usuario puede afectar su acceso al sistema y revocar sesiones
          activas según las reglas de auth_service.
        </p>
      </div>
    </section>
  );
}

function AdminUserReadOnlyInfo({ user }: { user: AdminUser }) {
  return (
    <section className="rounded-xl border border-[var(--ui-border)] bg-slate-50 px-6 py-5">
      <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">Información no editable</h2>
      <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <InfoValue label="ID de usuario" value={user.id} />
        <InfoValue label="CURP actual" value={user.curp} />
        <InfoValue label="Fecha de registro" value={formatAdminUserDate(user.createdAt)} />
        <InfoValue label="Última actualización" value={formatAdminUserDate(user.updatedAt)} />
      </dl>
    </section>
  );
}

function AdminUserReasonSection({
  reason,
  reasonError,
  onReasonChange,
}: Pick<AdminUserEditFormProps, "reason" | "reasonError" | "onReasonChange">) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Los cambios administrativos sensibles deben revisarse antes de guardar. El contrato
          vigente de auth_service no publica un campo para persistir el motivo.
        </p>
      </div>
      <Textarea
        id="edit-reason"
        label="Motivo del cambio *"
        placeholder="Describe brevemente el motivo de esta modificación..."
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        error={reasonError}
        hint="Este texto funciona como confirmación administrativa en la interfaz y no se envía al backend actual."
      />
    </section>
  );
}

function AdminUserEditActions({
  busy,
  onCancel,
}: Pick<AdminUserEditFormProps, "busy" | "onCancel">) {
  return (
    <div className="flex flex-col-reverse gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button variant="secondary" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={busy}>
        {busy ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}

export function AdminUserEditForm({
  user,
  form,
  statusId,
  reason,
  reasonError,
  instanceOptions,
  busy,
  onStatusChange,
  onReasonChange,
  onCancel,
  onSubmit,
}: AdminUserEditFormProps) {
  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="app-page"
    >
      <PageHeading
        eyebrow={
          <span>
            Configuración &gt; Usuarios &gt;{" "}
            <span className="text-[var(--ui-primary)]">Editar usuario</span>
          </span>
        }
        title="Editar usuario"
        description="Modifica los datos administrativos del usuario."
      />

      <AdminUserIdentityCard user={user} />
      <AdminUserGeneralFields
        form={form}
        statusId={statusId}
        instanceOptions={instanceOptions}
        onStatusChange={onStatusChange}
      />
      <AdminUserReadOnlyInfo user={user} />
      <AdminUserReasonSection
        reason={reason}
        reasonError={reasonError}
        onReasonChange={onReasonChange}
      />
      <AdminUserEditActions busy={busy} onCancel={onCancel} />
    </form>
  );
}
