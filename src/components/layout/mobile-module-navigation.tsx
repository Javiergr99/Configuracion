import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { ConfigurationSidebar } from "@/components/layout/configuration-sidebar";

type MobileModuleNavigationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: readonly string[];
};

export function MobileModuleNavigation({
  open,
  onOpenChange,
  permissions,
}: MobileModuleNavigationProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/50 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-[70] flex w-[min(19rem,88vw)] flex-col overflow-hidden bg-[var(--ui-sidebar)] shadow-2xl outline-none lg:hidden"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <Dialog.Title className="text-sm font-bold text-white">Navegación</Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                className="focus-ring grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10"
                aria-label="Cerrar navegación"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConfigurationSidebar
              variant="drawer"
              permissions={permissions}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
