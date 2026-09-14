import type { PermissionSelection } from "@/features/system-administration/model/admin-user.types";

export type AccessProfileDraft = {
  name: string;
  code: string;
  description: string;
  selection: PermissionSelection;
};

export const EMPTY_ACCESS_PROFILE_DRAFT: AccessProfileDraft = {
  name: "",
  code: "",
  description: "",
  selection: {
    groupIds: [],
    moduleIds: [],
    actionIds: [],
  },
};
