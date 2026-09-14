import { AlertTriangle, Info } from "lucide-react";
import type { ChangeEvent } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import { CompactPermissionTree } from "@/features/system-administration/components/compact-permission-tree";
import {
  CREATE_USER_PROFILE_OPTIONS,
  CREATE_USER_STATUS_OPTIONS,
  type CreateUserWizardValues,
} from "@/features/system-administration/model/admin-user-create-wizard";
import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import { getPermissionGroupPresentation } from "@/features/system-administration/model/system-access-presentation";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-base font-bold text-[var(--ui-text-primary)]">{children}</h2>;
}

export function AdminUserIdentityStep({
  register,
  control,
  errors,
  entityOptions,
  instanceOptions,
}: {
  register: UseFormRegister<CreateUserWizardValues>;
  control: Control<CreateUserWizardValues>;
  errors: FieldErrors<CreateUserWizardValues>;
  entityOptions: SelectOption[];
  instanceOptions: SelectOption[];
}) {
  return (
    <section className="px-6 py-6">
      <SectionTitle>Datos del usuario</SectionTitle>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
        <Input
          id="create-first-name"
          label="Nombre *"
          placeholder="Escriba el nombre(s)"
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <div>
          <Input
            id="create-curp"
            label="CURP *"
            placeholder="Ingrese CURP"
            maxLength={18}
            className="uppercase"
            {...register("curp", {
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                event.target.value = event.target.value.toUpperCase();
              },
            })}
            error={errors.curp?.message}
          />

          <p className="mt-1 text-[11px] text-[var(--ui-text-secondary)]">
            18 caracteres, se convertirá a mayúsculas.
          </p>
        </div>

        <Input
          id="create-first-surname"
          label="Primer apellido *"
          placeholder="Escriba el primer apellido"
          {...register("firstSurname")}
          error={errors.firstSurname?.message}
        />

        <Input
          id="create-email"
          type="email"
          label="Correo electrónico *"
          placeholder="ejemplo@dominio.gob.mx"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          id="create-second-surname"
          label="Segundo apellido"
          placeholder="Escriba el segundo apellido (Opcional)"
          {...register("secondSurname")}
          error={errors.secondSurname?.message}
        />

        <Input
          id="create-phone"
          label="Teléfono"
          placeholder="10 dígitos (Opcional)"
          maxLength={15}
          inputMode="tel"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <Controller
          name="entityId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Entidad federativa *"
              value={field.value}
              onValueChange={field.onChange}
              options={entityOptions}
              placeholder="Seleccione una opción"
              error={errors.entityId?.message}
            />
          )}
        />

        <Controller
          name="instanceId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Instancia *"
              value={field.value}
              onValueChange={field.onChange}
              options={instanceOptions}
              placeholder="Seleccione una opción"
              error={errors.instanceId?.message}
            />
          )}
        />

        <Controller
          name="statusId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Estatus inicial *"
              value={field.value}
              onValueChange={field.onChange}
              options={[...CREATE_USER_STATUS_OPTIONS]}
              error={errors.statusId?.message}
            />
          )}
        />
      </div>

      <div className="mt-8 flex items-center gap-3 border-l-4 border-[var(--ui-primary)] bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          El correo para crear la contraseña se envía después de guardar correctamente los accesos
          iniciales.
        </p>
      </div>
    </section>
  );
}

export function AdminUserScopeStep({
  control,
  errors,
  catalog,
  selectedGroupIds,
  onSelectedGroupIdsChange,
  entityLabel,
  instanceLabel,
}: {
  control: Control<CreateUserWizardValues>;
  errors: FieldErrors<CreateUserWizardValues>;
  catalog: PermissionCatalogGroup[];
  selectedGroupIds: string[];
  onSelectedGroupIdsChange: (ids: string[]) => void;
  entityLabel: string;
  instanceLabel: string;
}) {
  const selectedGroupIdSet = new Set(selectedGroupIds);

  const toggleGroup = (groupId: string, checked: boolean) => {
    const next = new Set(selectedGroupIds);

    if (checked) {
      next.add(groupId);
    } else {
      next.delete(groupId);
    }

    onSelectedGroupIdsChange([...next]);
  };

  return (
    <section className="px-6 py-6">
      <SectionTitle>Alcance y perfil</SectionTitle>

      <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
        Confirma el alcance institucional y selecciona los grupos que podrá administrar o utilizar.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--ui-border)] bg-slate-50 px-4 py-3">
          <div className="text-xs font-semibold text-[var(--ui-text-secondary)]">
            Entidad federativa
          </div>
          <div className="mt-1 text-sm font-semibold text-[var(--ui-text-primary)]">
            {entityLabel}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--ui-border)] bg-slate-50 px-4 py-3">
          <div className="text-xs font-semibold text-[var(--ui-text-secondary)]">Instancia</div>
          <div className="mt-1 text-sm font-semibold text-[var(--ui-text-primary)]">
            {instanceLabel}
          </div>
        </div>
      </div>

      <div className="mt-5 max-w-md">
        <Controller
          name="profileLabel"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Perfil descriptivo *"
              value={field.value}
              onValueChange={field.onChange}
              options={[...CREATE_USER_PROFILE_OPTIONS]}
              placeholder="Seleccione una opción"
              error={errors.profileLabel?.message}
            />
          )}
        />
      </div>

      <div className="mt-7">
        <h3 className="text-sm font-bold text-[var(--ui-text-primary)]">Grupos y registros</h3>

        <p className="mt-1 text-xs leading-5 text-[var(--ui-text-secondary)]">
          Selecciona al menos un grupo. La asignación detallada de módulos y acciones se realizará
          en el paso Permisos.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {catalog.map((group) => {
            const checked = selectedGroupIdSet.has(group.id);
            const presentation = getPermissionGroupPresentation(group.name);

            return (
              <label
                key={group.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
                  checked
                    ? "border-brand-600 bg-brand-50"
                    : "border-[var(--ui-border)] bg-[var(--ui-surface)] hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleGroup(group.id, event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--ui-primary)]"
                />

                <span>
                  <span className="block text-sm font-semibold text-[var(--ui-text-primary)]">
                    {presentation.title}
                  </span>
                  {presentation.scope ? (
                    <span className="mt-0.5 block text-xs font-medium text-[var(--ui-primary)]">
                      {presentation.scope}
                    </span>
                  ) : null}
                  <span className="mt-1 block break-all font-mono text-[10px] text-slate-400">
                    {presentation.technicalName}
                  </span>

                  {group.description ? (
                    <span className="mt-1.5 block text-xs leading-5 text-[var(--ui-text-secondary)]">
                      {group.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          El perfil descriptivo es una referencia visual. Los permisos efectivos son los grupos,
          módulos y acciones que auth_service asigna al usuario.
        </p>
      </div>
    </section>
  );
}

function selectedNames(
  catalog: PermissionCatalogGroup[],
  selection: PermissionSelection,
): {
  groups: string[];
  modules: string[];
} {
  const selectedGroupIds = new Set(selection.groupIds);
  const selectedModuleIds = new Set(selection.moduleIds);
  const selectedActionIds = new Set(selection.actionIds);

  const groupNames = new Set<string>();
  const moduleNames = new Set<string>();

  for (const group of catalog) {
    let hasSelectedModule = false;

    for (const module of group.modules) {
      let moduleSelected = selectedModuleIds.has(module.id);

      if (!moduleSelected) {
        for (const action of module.actions) {
          if (selectedActionIds.has(action.id)) {
            moduleSelected = true;
            break;
          }
        }
      }

      if (moduleSelected) {
        hasSelectedModule = true;
        moduleNames.add(module.name);
      }
    }

    if (selectedGroupIds.has(group.id) || hasSelectedModule) {
      const presentation = getPermissionGroupPresentation(group.name);
      groupNames.add(
        presentation.scope ? `${presentation.title} — ${presentation.scope}` : presentation.title,
      );
    }
  }

  return {
    groups: [...groupNames],
    modules: [...moduleNames],
  };
}

export function AdminUserPermissionsStep({
  catalog,
  selection,
  onSelectionChange,
  search,
  onSearchChange,
  lockedActionIds,
  entityLabel,
  instanceLabel,
}: {
  catalog: PermissionCatalogGroup[];
  selection: PermissionSelection;
  onSelectionChange: (next: PermissionSelection) => void;
  search: string;
  onSearchChange: (value: string) => void;
  lockedActionIds: Set<string>;
  entityLabel: string;
  instanceLabel: string;
}) {
  const names = selectedNames(catalog, selection);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
      <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm">
        <div className="px-6 pt-6">
          <SectionTitle>Asignar permisos</SectionTitle>

          <div className="mt-5">
            <SearchField
              value={search}
              onChange={onSearchChange}
              placeholder="Buscar permisos..."
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <CompactPermissionTree
            catalog={catalog}
            selection={selection}
            onSelectionChange={onSelectionChange}
            search={search}
            lockedActionIds={lockedActionIds}
          />
        </div>
      </section>

      <aside className="self-start rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-sm">
        <SectionTitle>Resumen de selección</SectionTitle>

        <dl className="mt-5 space-y-4 text-sm">
          <div className="border-b border-[var(--ui-border)] pb-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ui-text-secondary)]">
              Grupos seleccionados: {names.groups.length}
            </dt>

            <dd className="mt-2 space-y-1 text-[var(--ui-text-primary)]">
              {names.groups.length
                ? names.groups.map((name) => <div key={name}>• {name}</div>)
                : "Sin grupos"}
            </dd>
          </div>

          <div className="border-b border-[var(--ui-border)] pb-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ui-text-secondary)]">
              Módulos seleccionados: {names.modules.length}
            </dt>

            <dd className="mt-2 leading-5 text-[var(--ui-text-primary)]">
              {names.modules.length ? names.modules.join(", ") : "Sin módulos"}
            </dd>
          </div>

          <div className="border-b border-[var(--ui-border)] pb-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ui-text-secondary)]">
              Acciones seleccionadas: {selection.actionIds.length}
            </dt>
            <dd className="mt-2 text-[var(--ui-text-primary)]">
              Visualización acumulada de permisos seleccionados.
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ui-text-secondary)]">
              Alcance efectivo
            </dt>
            <dd className="mt-2 font-semibold text-[var(--ui-text-primary)]">
              {instanceLabel} — {entityLabel}
            </dd>
          </div>
        </dl>

        {selection.actionIds.length >= 10 ? (
          <div className="mt-5 flex gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>El usuario tendrá acceso a múltiples funciones administrativas o sensibles.</span>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--ui-text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--ui-text-primary)]">
        {value || "No registrado"}
      </dd>
    </div>
  );
}

export function AdminUserReviewStep({
  values,
  catalog,
  selection,
  entityLabel,
  instanceLabel,
  confirmed,
  onConfirmedChange,
}: {
  values: CreateUserWizardValues;
  catalog: PermissionCatalogGroup[];
  selection: PermissionSelection;
  entityLabel: string;
  instanceLabel: string;
  confirmed: boolean;
  onConfirmedChange: (checked: boolean) => void;
}) {
  const names = selectedNames(catalog, selection);

  const fullName = [values.firstName, values.firstSurname, values.secondSurname]
    .filter(Boolean)
    .join(" ");

  const statusLabel =
    CREATE_USER_STATUS_OPTIONS.find((item) => item.value === values.statusId)?.label ??
    values.statusId;

  return (
    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm">
      <div className="space-y-6 px-6 py-6">
        <div>
          <SectionTitle>Datos personales</SectionTitle>

          <dl className="mt-5 grid grid-cols-2 gap-x-12 gap-y-4">
            <ReviewValue label="Nombre completo" value={fullName} />
            <ReviewValue label="CURP" value={values.curp} />
            <ReviewValue label="Correo electrónico" value={values.email} />
            <ReviewValue label="Teléfono" value={values.phone || "No registrado"} />
          </dl>
        </div>

        <div className="border-t border-[var(--ui-border)] pt-6">
          <SectionTitle>Alcance y perfil</SectionTitle>

          <dl className="mt-5 grid grid-cols-2 gap-x-12 gap-y-4">
            <ReviewValue label="Entidad federativa" value={entityLabel} />
            <ReviewValue label="Instancia" value={instanceLabel} />

            <div>
              <dt className="text-xs font-medium text-[var(--ui-text-secondary)]">Estatus</dt>
              <dd className="mt-1">
                <span className="inline-flex rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                  {statusLabel}
                </span>
              </dd>
            </div>

            <ReviewValue label="Perfil descriptivo" value={values.profileLabel} />
          </dl>
        </div>

        <div className="border-t border-[var(--ui-border)] pt-6">
          <SectionTitle>Permisos asignados</SectionTitle>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              [String(names.groups.length), "Grupos"],
              [String(names.modules.length), "Módulos"],
              [String(selection.actionIds.length), "Acciones autorizadas"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--ui-border)] bg-slate-50 px-4 py-3"
              >
                <div className="text-lg font-bold text-[var(--ui-primary)]">{value}</div>
                <div className="mt-0.5 text-xs text-[var(--ui-text-secondary)]">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[var(--ui-border)] bg-slate-50 px-4 py-3">
            {names.groups.map((groupName) => (
              <div
                key={groupName}
                className="flex items-center gap-2 py-1 text-sm font-semibold text-[var(--ui-text-primary)]"
              >
                <span className="text-slate-500">□</span>
                {groupName}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--ui-border)] pt-6">
          <SectionTitle>Notificación</SectionTitle>

          <div className="mt-4 flex items-center gap-3 border-l-4 border-[var(--ui-primary)] bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Se solicitará a auth_service el envío del correo de activación a{" "}
              <strong>{values.email}</strong> una vez asignados los permisos.
            </span>
          </div>
        </div>

        <label className="flex items-start gap-3 border-t border-[var(--ui-border)] pt-5 text-sm text-[var(--ui-text-primary)]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => onConfirmedChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--ui-primary)]"
          />
          <span>Confirmo que revisé la información y los permisos asignados.</span>
        </label>
      </div>
    </section>
  );
}
