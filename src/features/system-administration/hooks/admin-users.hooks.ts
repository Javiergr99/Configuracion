import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminUsersKeys } from "@/features/system-administration/api/admin-users.keys";
import { adminUsersService } from "@/features/system-administration/api/admin-users.service";
import type {
  AdminPermissionUpdateInput,
  AdminUserFilters,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "@/features/system-administration/model/admin-user.types";

export function useAdminUsers(filters: AdminUserFilters, enabled = true) {
  return useQuery({
    queryKey: adminUsersKeys.list(filters),
    queryFn: () => adminUsersService.listUsers(filters),
    enabled,
  });
}

export function useAdminCurrentUser() {
  return useQuery({
    queryKey: adminUsersKeys.current(),
    queryFn: () => adminUsersService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: adminUsersKeys.detail(id ?? "none"),
    queryFn: () => adminUsersService.getUser(id as string),
    enabled: Boolean(id),
  });
}

function invalidateAdministration(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: adminUsersKeys.all,
  });
}

async function invalidateUserState(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: adminUsersKeys.detail(userId),
    }),
    queryClient.invalidateQueries({
      queryKey: adminUsersKeys.lists(),
    }),
  ]);
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => adminUsersService.createUser(input),
    onSuccess: () => invalidateAdministration(queryClient),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminUserInput }) =>
      adminUsersService.updateUser(id, input),
    onSuccess: async (user) => {
      queryClient.setQueryData(adminUsersKeys.detail(user.id), user);

      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
    },
  });
}

export function useAdminUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: number }) =>
      adminUsersService.changeStatus(id, statusId),
    onSuccess: async (user) => {
      queryClient.setQueryData(adminUsersKeys.detail(user.id), user);

      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
    },
  });
}

export function useResendActivationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersService.resendActivation(id),
    onSuccess: async (_result, userId) => {
      await invalidateUserState(queryClient, userId);
    },
  });
}

export function usePasswordRecoveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersService.sendPasswordRecovery(id),
    onSuccess: async (_result, userId) => {
      await invalidateUserState(queryClient, userId);
    },
  });
}

export function usePermissionCatalog(enabled = true) {
  return useQuery({
    queryKey: adminUsersKeys.catalog(),
    queryFn: () => adminUsersService.getPermissionCatalog(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useUpdatePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminPermissionUpdateInput }) =>
      adminUsersService.updatePermissions(id, input),
    onSuccess: async (result) => {
      queryClient.setQueryData(adminUsersKeys.detail(result.user.id), result.user);

      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
    },
  });
}
