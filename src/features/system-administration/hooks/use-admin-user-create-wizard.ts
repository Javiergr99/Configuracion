import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useReducer } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { SelectOption } from "@/components/ui/select-field";
import { getAdminErrorMessage } from "@/features/system-administration/api/admin-api-error";
import {
  useAdminCurrentUser,
  useAdminUsers,
  useCreateAdminUser,
  usePermissionCatalog,
} from "@/features/system-administration/hooks/admin-users.hooks";
import { isSuperAdmin } from "@/features/system-administration/model/admin-authorization";
import { buildInitialPermissionAssignmentPlan } from "@/features/system-administration/model/initial-permission-assignment";
import {
  createUserWizardSchema,
  type CreateUserWizardValues,
} from "@/features/system-administration/model/admin-user-create-wizard";
import type {
  AdminUserFilters,
  CreateAdminUserResult,
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import {
  formatScopedPermissionRequirement,
  missingScopedRequirementsForInitialPermissionPlan,
} from "@/features/system-administration/model/permission-scope";
import { emptyPermissionSelection } from "@/features/system-administration/model/permission-selection";
import { FEDERAL_ENTITY_CATALOG, getFederalEntityName } from "@/shared/catalogs/federal-entities";

const EMPTY_PERMISSION_CATALOG: PermissionCatalogGroup[] = [];

const EMPTY_SELECT_OPTIONS: SelectOption[] = [];

export const ADMIN_USER_ENTITY_OPTIONS: SelectOption[] = FEDERAL_ENTITY_CATALOG.map((entity) => ({
  value: String(entity.id),
  label: entity.label,
}));

const USER_OPTIONS_FILTERS: AdminUserFilters = {
  search: "",
  status: "",
  instanceId: "",
  entityId: "",
  groupId: "",
  page: 1,
  pageSize: 100,
};

const STEP_ONE_FIELDS: Array<keyof CreateUserWizardValues> = [
  "firstName",
  "firstSurname",
  "secondSurname",
  "curp",
  "email",
  "phone",
  "entityId",
  "instanceId",
  "statusId",
];

type WizardState = {
  step: number;
  selection: PermissionSelection;
  permissionSearch: string;
  confirmed: boolean;
  stepError: string;
  result: CreateAdminUserResult | null;
};

type WizardAction =
  | {
      type: "set-step";
      step: number;
    }
  | {
      type: "set-selection";
      selection: PermissionSelection;
    }
  | {
      type: "set-search";
      value: string;
    }
  | {
      type: "set-confirmed";
      value: boolean;
    }
  | {
      type: "set-error";
      message: string;
    }
  | {
      type: "set-result";
      result: CreateAdminUserResult | null;
    }
  | {
      type: "reset";
    };

function createWizardState(): WizardState {
  return {
    step: 1,
    selection: emptyPermissionSelection(),
    permissionSearch: "",
    confirmed: false,
    stepError: "",
    result: null,
  };
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "set-step":
      return {
        ...state,
        step: action.step,
      };

    case "set-selection":
      return {
        ...state,
        selection: action.selection,
      };

    case "set-search":
      return {
        ...state,
        permissionSearch: action.value,
      };

    case "set-confirmed":
      return {
        ...state,
        confirmed: action.value,
      };

    case "set-error":
      return {
        ...state,
        stepError: action.message,
      };

    case "set-result":
      return {
        ...state,
        result: action.result,
      };

    case "reset":
      return createWizardState();

    default:
      return state;
  }
}

function getLockedSuperAdminActionIds(
  catalog: PermissionCatalogGroup[],
  actorCanAssignSuperAdmin: boolean,
): Set<string> {
  const lockedIds = new Set<string>();

  if (actorCanAssignSuperAdmin) {
    return lockedIds;
  }

  for (const group of catalog) {
    for (const module of group.modules) {
      for (const action of module.actions) {
        if (action.name === "SUPER_ADMIN") {
          lockedIds.add(action.id);
        }
      }
    }
  }

  return lockedIds;
}

function filterSelectedCatalog(
  catalog: PermissionCatalogGroup[],
  groupIds: string[],
): PermissionCatalogGroup[] {
  if (!groupIds.length) return catalog;

  const selectedIds = new Set(groupIds);
  const selected: PermissionCatalogGroup[] = [];

  for (const group of catalog) {
    if (selectedIds.has(group.id)) {
      selected.push(group);
    }
  }

  return selected;
}

function getRemovedPermissionIds(
  catalog: PermissionCatalogGroup[],
  allowedGroupIds: ReadonlySet<string>,
) {
  const moduleIds = new Set<string>();
  const actionIds = new Set<string>();

  for (const group of catalog) {
    if (allowedGroupIds.has(group.id)) {
      continue;
    }

    for (const module of group.modules) {
      moduleIds.add(module.id);

      for (const action of module.actions) {
        actionIds.add(action.id);
      }
    }
  }

  return {
    moduleIds,
    actionIds,
  };
}

function getInstanceOptions(
  options: SelectOption[],
  actor:
    | {
        instanceId?: number | null;
        instance: string;
      }
    | null
    | undefined,
): SelectOption[] {
  if (!actor?.instanceId) {
    return options;
  }

  const actorId = String(actor.instanceId);

  if (options.some((item) => item.value === actorId)) {
    return options;
  }

  return [
    {
      value: actorId,
      label: actor.instance,
    },
    ...options,
  ];
}

export function useAdminUserCreateWizard() {
  const navigate = useNavigate();
  const currentUserQuery = useAdminCurrentUser();
  const catalogQuery = usePermissionCatalog(true);
  const usersQuery = useAdminUsers(USER_OPTIONS_FILTERS, currentUserQuery.isSuccess);
  const createMutation = useCreateAdminUser();

  const [state, dispatch] = useReducer(wizardReducer, undefined, () => createWizardState());

  const form = useForm<CreateUserWizardValues>({
    resolver: zodResolver(createUserWizardSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      firstSurname: "",
      secondSurname: "",
      curp: "",
      email: "",
      phone: "",
      entityId: "",
      instanceId: "",
      statusId: "2",
      profileLabel: "Administrador",
    },
  });

  const catalog = catalogQuery.data ?? EMPTY_PERMISSION_CATALOG;

  const actorCanAssignSuperAdmin = isSuperAdmin(currentUserQuery.data);

  const lockedActionIds = useMemo(
    () => getLockedSuperAdminActionIds(catalog, actorCanAssignSuperAdmin),
    [actorCanAssignSuperAdmin, catalog],
  );

  const instanceOptions = useMemo(
    () =>
      getInstanceOptions(
        usersQuery.data?.filterOptions.instances ?? EMPTY_SELECT_OPTIONS,
        currentUserQuery.data,
      ),
    [currentUserQuery.data, usersQuery.data?.filterOptions.instances],
  );

  const values = form.watch();

  const entityLabel = values.entityId
    ? getFederalEntityName(Number(values.entityId))
    : "Sin seleccionar";

  const instanceLabel =
    instanceOptions.find((option) => option.value === values.instanceId)?.label ??
    (values.instanceId ? `Instancia ${values.instanceId}` : "Sin seleccionar");

  const selectedCatalog = useMemo(
    () => filterSelectedCatalog(catalog, state.selection.groupIds),
    [catalog, state.selection.groupIds],
  );

  const setSelection = (selection: PermissionSelection) => {
    dispatch({
      type: "set-selection",
      selection,
    });
  };

  const updateSelectedGroups = (groupIds: string[]) => {
    const allowedGroupIds = new Set(groupIds);

    const removed = getRemovedPermissionIds(catalog, allowedGroupIds);

    setSelection({
      groupIds,
      moduleIds: state.selection.moduleIds.filter((id) => !removed.moduleIds.has(id)),
      actionIds: state.selection.actionIds.filter((id) => !removed.actionIds.has(id)),
    });
  };

  const setError = (message: string) => {
    dispatch({
      type: "set-error",
      message,
    });
  };

  const goNext = async () => {
    setError("");

    if (state.step === 1) {
      const valid = await form.trigger(STEP_ONE_FIELDS);

      if (!valid) return;

      if (!instanceOptions.length) {
        setError("No hay instancias disponibles en la información visible de auth_service.");
        return;
      }

      dispatch({
        type: "set-step",
        step: 2,
      });
      return;
    }

    if (state.step === 2) {
      const valid = await form.trigger(["profileLabel"]);

      if (!valid) return;

      if (!state.selection.groupIds.length) {
        setError("Selecciona al menos un grupo o registro para continuar.");
        return;
      }

      dispatch({
        type: "set-step",
        step: 3,
      });
      return;
    }

    if (state.step === 3) {
      dispatch({
        type: "set-step",
        step: 4,
      });
    }
  };

  const submit = async () => {
    setError("");

    const valid = await form.trigger();

    if (!valid) return;

    const primaryGroupId = state.selection.groupIds[0];

    if (!primaryGroupId) {
      setError("Selecciona al menos un sistema o grupo para crear al usuario.");
      return;
    }

    const initialPlan = buildInitialPermissionAssignmentPlan(state.selection, catalog);
    const missingRequirements = missingScopedRequirementsForInitialPermissionPlan(
      initialPlan,
      catalog,
      currentUserQuery.data,
    );

    if (missingRequirements.length) {
      setError(
        `No tienes autorización suficiente para crear este acceso: ${missingRequirements
          .map(formatScopedPermissionRequirement)
          .join(", ")}.`,
      );
      return;
    }

    if (!state.confirmed) {
      setError("Confirma que revisaste la información y los permisos asignados.");
      return;
    }

    const currentValues = form.getValues();

    try {
      const created = await createMutation.mutateAsync({
        firstName: currentValues.firstName,
        firstSurname: currentValues.firstSurname,
        secondSurname: currentValues.secondSurname,
        curp: currentValues.curp,
        email: currentValues.email,
        phone: currentValues.phone,
        instanceId: Number(currentValues.instanceId),
        entityId: Number(currentValues.entityId),
        statusId: Number(currentValues.statusId),
        groupId: primaryGroupId,
        groupIds: state.selection.groupIds,
        moduleIds: state.selection.moduleIds,
        actionIds: state.selection.actionIds,
      });

      dispatch({
        type: "set-result",
        result: created,
      });

      if (created.warning) {
        toast.warning(created.warning, { duration: 9000 });
      } else {
        toast.success("Usuario registrado correctamente.");
      }
    } catch (error) {
      setError(getAdminErrorMessage(error, "No fue posible registrar al usuario."));
    }
  };

  const resetWizard = () => {
    form.reset();
    dispatch({ type: "reset" });
  };

  const goBack = () => {
    dispatch({
      type: "set-step",
      step: Math.max(1, state.step - 1),
    });
  };

  const goToUsers = () => {
    void navigate("/app/usuarios");
  };

  const viewCreatedUser = () => {
    if (!state.result) return;

    void navigate(`/app/usuarios?user=${encodeURIComponent(state.result.user.id)}`);
  };

  return {
    state,
    form,
    catalog,
    selectedCatalog,
    lockedActionIds,
    entityLabel,
    instanceLabel,
    entityOptions: ADMIN_USER_ENTITY_OPTIONS,
    instanceOptions,
    isLoading: catalogQuery.isLoading || currentUserQuery.isLoading,
    isPending: createMutation.isPending,
    setSelection,
    setPermissionSearch: (value: string) =>
      dispatch({
        type: "set-search",
        value,
      }),
    setConfirmed: (value: boolean) =>
      dispatch({
        type: "set-confirmed",
        value,
      }),
    updateSelectedGroups,
    goNext,
    submit,
    resetWizard,
    goBack,
    goToUsers,
    viewCreatedUser,
  };
}
