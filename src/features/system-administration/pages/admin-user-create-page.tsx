import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { AdminUserCreateSuccess } from "@/features/system-administration/components/admin-user-create-success";
import { AdminUserCreateWizardContent } from "@/features/system-administration/components/admin-user-create-wizard-content";
import { useAdminUserCreateWizard } from "@/features/system-administration/hooks/use-admin-user-create-wizard";

export function AdminUserCreatePage() {
  const wizard = useAdminUserCreateWizard();
  const result = wizard.state.result;

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          result ? (
            <span>
              Configuración &gt; <span className="text-[var(--ui-primary)]">Usuarios</span>
            </span>
          ) : (
            <span>
              Configuración &gt; Usuarios &gt;{" "}
              <span className="text-[var(--ui-primary)]">Nuevo usuario</span>
            </span>
          )
        }
        title={result ? "Administración de usuarios" : "Registrar nuevo usuario"}
        description={
          result
            ? "Consulta, registra y administra cuentas, accesos y permisos del sistema."
            : "Captura los datos, define su alcance y asigna los permisos iniciales."
        }
        actions={
          result ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  void wizard.goToUsers();
                }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Actualizar
              </Button>

              <Button onClick={wizard.resetWizard}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nuevo usuario
              </Button>
            </>
          ) : undefined
        }
      />

      {result ? (
        <AdminUserCreateSuccess
          result={result}
          onViewUser={() => {
            void wizard.viewCreatedUser();
          }}
          onCreateAnother={wizard.resetWizard}
          onBackToList={() => {
            void wizard.goToUsers();
          }}
        />
      ) : (
        <AdminUserCreateWizardContent
          step={wizard.state.step}
          form={wizard.form}
          catalog={wizard.catalog}
          selectedCatalog={wizard.selectedCatalog}
          selection={wizard.state.selection}
          permissionSearch={wizard.state.permissionSearch}
          lockedActionIds={wizard.lockedActionIds}
          entityLabel={wizard.entityLabel}
          instanceLabel={wizard.instanceLabel}
          entityOptions={wizard.entityOptions}
          instanceOptions={wizard.instanceOptions}
          stepError={wizard.state.stepError}
          confirmed={wizard.state.confirmed}
          isLoading={wizard.isLoading}
          isPending={wizard.isPending}
          onSelectionChange={wizard.setSelection}
          onPermissionSearchChange={wizard.setPermissionSearch}
          onConfirmedChange={wizard.setConfirmed}
          onSelectedGroupIdsChange={wizard.updateSelectedGroups}
          onCancel={wizard.goToUsers}
          onPrevious={wizard.goBack}
          onNext={wizard.goNext}
          onSubmit={wizard.submit}
        />
      )}
    </div>
  );
}
