import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { SelectOption } from "@/components/ui/select-field";
import { AdminUserCreateStepper } from "@/features/system-administration/components/admin-user-create-stepper";
import {
  AdminUserIdentityStep,
  AdminUserPermissionsStep,
  AdminUserReviewStep,
  AdminUserScopeStep,
} from "@/features/system-administration/components/admin-user-create-steps";
import { AdminWizardFooter } from "@/features/system-administration/components/admin-wizard-footer";
import type { CreateUserWizardValues } from "@/features/system-administration/model/admin-user-create-wizard";
import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";

export type AdminUserCreateWizardContentProps = {
  step: number;
  form: UseFormReturn<CreateUserWizardValues>;
  catalog: PermissionCatalogGroup[];
  selectedCatalog: PermissionCatalogGroup[];
  selection: PermissionSelection;
  permissionSearch: string;
  lockedActionIds: Set<string>;
  entityLabel: string;
  instanceLabel: string;
  entityOptions: SelectOption[];
  instanceOptions: SelectOption[];
  stepError: string;
  confirmed: boolean;
  isLoading: boolean;
  isPending: boolean;
  onSelectionChange: (next: PermissionSelection) => void;
  onPermissionSearchChange: (value: string) => void;
  onConfirmedChange: (value: boolean) => void;
  onSelectedGroupIdsChange: (groupIds: string[]) => void;
  onCancel: () => void;
  onPrevious: () => void;
  onNext: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
};

function identityStep(props: AdminUserCreateWizardContentProps): ReactNode {
  return (
    <AdminUserIdentityStep
      register={props.form.register}
      control={props.form.control}
      errors={props.form.formState.errors}
      entityOptions={props.entityOptions}
      instanceOptions={props.instanceOptions}
    />
  );
}

function scopeStep(props: AdminUserCreateWizardContentProps): ReactNode {
  return (
    <AdminUserScopeStep
      control={props.form.control}
      errors={props.form.formState.errors}
      catalog={props.catalog}
      selectedGroupIds={props.selection.groupIds}
      onSelectedGroupIdsChange={props.onSelectedGroupIdsChange}
      entityLabel={props.entityLabel}
      instanceLabel={props.instanceLabel}
    />
  );
}

function permissionsStep(props: AdminUserCreateWizardContentProps): ReactNode {
  return (
    <AdminUserPermissionsStep
      catalog={props.selectedCatalog}
      selection={props.selection}
      onSelectionChange={props.onSelectionChange}
      search={props.permissionSearch}
      onSearchChange={props.onPermissionSearchChange}
      lockedActionIds={props.lockedActionIds}
      entityLabel={props.entityLabel}
      instanceLabel={props.instanceLabel}
    />
  );
}

function reviewStep(props: AdminUserCreateWizardContentProps): ReactNode {
  return (
    <AdminUserReviewStep
      values={props.form.getValues()}
      catalog={props.catalog}
      selection={props.selection}
      entityLabel={props.entityLabel}
      instanceLabel={props.instanceLabel}
      confirmed={props.confirmed}
      onConfirmedChange={props.onConfirmedChange}
    />
  );
}

function wizardStepContent(props: AdminUserCreateWizardContentProps): ReactNode {
  const contentByStep: Record<number, ReactNode> = {
    1: identityStep(props),
    2: scopeStep(props),
    3: permissionsStep(props),
    4: reviewStep(props),
  };

  return contentByStep[props.step] ?? null;
}

function primaryStepPanel(props: AdminUserCreateWizardContentProps) {
  return (
    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm">
      {wizardStepContent(props)}
      {props.stepError ? <WizardError message={props.stepError} placement="bottom" /> : null}
      <AdminWizardFooter
        onCancel={props.onCancel}
        onPrevious={props.step > 1 ? props.onPrevious : undefined}
        onNext={props.onNext}
        nextDisabled={props.isLoading}
      />
    </section>
  );
}

function advancedStepPanel(props: AdminUserCreateWizardContentProps) {
  const isFinalStep = props.step === 4;
  const nextLabel = isFinalStep
    ? props.isPending
      ? "Registrando..."
      : "Registrar usuario"
    : "Siguiente";

  return (
    <>
      {wizardStepContent(props)}
      <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm">
        {props.stepError ? <WizardError message={props.stepError} placement="top" /> : null}
        <AdminWizardFooter
          onCancel={props.onCancel}
          onPrevious={props.onPrevious}
          onNext={isFinalStep ? props.onSubmit : props.onNext}
          nextLabel={nextLabel}
          nextDisabled={props.isPending || (isFinalStep && !props.confirmed)}
          nextIcon={
            isFinalStep ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : undefined
          }
        />
      </div>
    </>
  );
}

export function AdminUserCreateWizardContent(props: AdminUserCreateWizardContentProps) {
  const stepPanel = props.step < 3 ? primaryStepPanel(props) : advancedStepPanel(props);

  return (
    <>
      <AdminUserCreateStepper currentStep={props.step} />
      {stepPanel}
    </>
  );
}

function WizardError({ message, placement }: { message: string; placement: "top" | "bottom" }) {
  const placementClass =
    placement === "top"
      ? "mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      : "mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";

  return <div className={placementClass}>{message}</div>;
}
