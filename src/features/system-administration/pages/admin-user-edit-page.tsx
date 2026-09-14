import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useNavigate, useParams, type NavigateFunction } from "react-router";
import { toast } from "sonner";

import {
  AdminUserEditForm,
  AdminUserEditLoading,
  AdminUserEditProtected,
  AdminUserEditUnavailable,
} from "@/features/system-administration/components/admin-user-edit-sections";
import { getAdminErrorMessage } from "@/features/system-administration/api/admin-api-error";
import {
  useAdminCurrentUser,
  useAdminUser,
  useAdminUsers,
  useAdminUserStatusMutation,
  useUpdateAdminUser,
} from "@/features/system-administration/hooks/admin-users.hooks";
import {
  hasAdminAction,
  isSuperAdmin,
} from "@/features/system-administration/model/admin-authorization";
import {
  buildAdminUserEditDefaultValues,
  buildAdminUserInstanceOptions,
  buildAdminUserUpdateInput,
  getAdminUserProtectionMessage,
  type AdminUserEditDirtyFields,
} from "@/features/system-administration/model/admin-user-edit";
import {
  updateAdminUserSchema,
  type UpdateAdminUserFormValues,
} from "@/features/system-administration/model/admin-user.schema";
import type {
  AdminSelectOption,
  AdminUser,
  AdminUserFilters,
  UpdateAdminUserInput,
} from "@/features/system-administration/model/admin-user.types";

const userOptionsFilters: AdminUserFilters = {
  search: "",
  status: "",
  instanceId: "",
  entityId: "",
  groupId: "",
  page: 1,
  pageSize: 100,
};

type UpdateUserCommand = (params: { id: string; input: UpdateAdminUserInput }) => Promise<unknown>;

type UpdateStatusCommand = (params: { id: string; statusId: number }) => Promise<unknown>;

type SubmissionContext = {
  user: AdminUser;
  userId: string;
  statusId: string;
  reason: string;
  dirtyFields: AdminUserEditDirtyFields;
  updateUser: UpdateUserCommand;
  updateStatus: UpdateStatusCommand;
  navigate: NavigateFunction;
  setReasonError: (message: string) => void;
};

function createSubmitHandler(context: SubmissionContext) {
  return async (values: UpdateAdminUserFormValues) => {
    const statusChanged = context.statusId !== String(context.user.statusId ?? "");
    const hasFieldChanges = Object.keys(context.dirtyFields).length > 0;

    if (!hasFieldChanges && !statusChanged) {
      toast.info("No hay cambios pendientes.");
      return;
    }

    if (!context.reason.trim()) {
      context.setReasonError("Describe brevemente el motivo de la modificación.");
      return;
    }

    context.setReasonError("");
    const input = buildAdminUserUpdateInput(values, context.dirtyFields);

    try {
      if (Object.keys(input).length > 0) {
        await context.updateUser({ id: context.userId, input });
      }

      if (statusChanged && context.statusId) {
        await context.updateStatus({
          id: context.userId,
          statusId: Number(context.statusId),
        });
      }

      toast.success("Usuario actualizado correctamente.");
      void context.navigate(`/app/usuarios?user=${encodeURIComponent(context.userId)}`);
    } catch (error) {
      toast.error(getAdminErrorMessage(error, "No fue posible actualizar al usuario."));
    }
  };
}

function bindSubmitHandler({
  form,
  user,
  userId,
  statusId,
  reason,
  updateUser,
  updateStatus,
  navigate,
  setReasonError,
}: {
  form: UseFormReturn<UpdateAdminUserFormValues>;
  user: AdminUser;
  userId: string;
  statusId: string;
  reason: string;
  updateUser: UpdateUserCommand;
  updateStatus: UpdateStatusCommand;
  navigate: NavigateFunction;
  setReasonError: (message: string) => void;
}) {
  return form.handleSubmit(
    createSubmitHandler({
      user,
      userId,
      statusId,
      reason,
      dirtyFields: form.formState.dirtyFields,
      updateUser,
      updateStatus,
      navigate,
      setReasonError,
    }),
  );
}

function createReasonChangeHandler(
  setReason: (value: string) => void,
  setReasonError: (message: string) => void,
) {
  return (value: string) => {
    setReason(value);

    if (value.trim()) {
      setReasonError("");
    }
  };
}

function createCancelHandler(navigate: NavigateFunction, user: AdminUser) {
  return () => {
    void navigate(`/app/usuarios?user=${encodeURIComponent(user.id)}`);
  };
}

type AdminUserEditorProps = {
  user: AdminUser;
  userId: string;
  instanceOptions: AdminSelectOption[];
};

function AdminUserEditor({ user, userId, instanceOptions }: AdminUserEditorProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateAdminUser();
  const statusMutation = useAdminUserStatusMutation();
  const [statusId, setStatusId] = useState(() => (user.statusId ? String(user.statusId) : ""));
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const form = useForm<UpdateAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: buildAdminUserEditDefaultValues(user),
  });

  const onSubmit = bindSubmitHandler({
    form,
    user,
    userId,
    statusId,
    reason,
    updateUser: updateMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    navigate,
    setReasonError,
  });

  return (
    <AdminUserEditForm
      user={user}
      form={form}
      statusId={statusId}
      reason={reason}
      reasonError={reasonError}
      instanceOptions={instanceOptions}
      busy={updateMutation.isPending || statusMutation.isPending}
      onStatusChange={setStatusId}
      onReasonChange={createReasonChangeHandler(setReason, setReasonError)}
      onCancel={createCancelHandler(navigate, user)}
      onSubmit={onSubmit}
    />
  );
}

function AdminUserEditResolved({ userId }: { userId: string }) {
  const currentUserQuery = useAdminCurrentUser();
  const userQuery = useAdminUser(userId);
  const usersQuery = useAdminUsers(userOptionsFilters, currentUserQuery.isSuccess);

  if (userQuery.isLoading || currentUserQuery.isLoading) {
    return <AdminUserEditLoading />;
  }

  const user = userQuery.data;
  const actor = currentUserQuery.data;

  if (!user) {
    return <AdminUserEditUnavailable />;
  }

  const selfTarget = Boolean(actor && actor.id === user.id);
  const superAdminTarget = isSuperAdmin(user);
  const canEdit = hasAdminAction(actor, "ACTUALIZAR_USUARIO");

  if (!canEdit || selfTarget || superAdminTarget) {
    return (
      <AdminUserEditProtected
        message={getAdminUserProtectionMessage({
          selfTarget,
          superAdminTarget,
        })}
      />
    );
  }

  const instanceOptions = buildAdminUserInstanceOptions(
    user,
    usersQuery.data?.filterOptions.instances ?? [],
  );

  return (
    <AdminUserEditor key={user.id} user={user} userId={userId} instanceOptions={instanceOptions} />
  );
}

export function AdminUserEditPage() {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return <AdminUserEditUnavailable />;
  }

  return <AdminUserEditResolved key={userId} userId={userId} />;
}
