import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type WizardAction = () => void | Promise<void>;

export function AdminWizardFooter({
  onCancel,
  onPrevious,
  onNext,
  nextLabel = "Siguiente",
  nextDisabled,
  nextIcon,
}: {
  onCancel: WizardAction;
  onPrevious?: WizardAction;
  onNext: WizardAction;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--ui-border)] px-6 py-4">
      <Button
        variant="ghost"
        onClick={() => {
          void onCancel();
        }}
      >
        Cancelar
      </Button>

      <div className="flex items-center gap-3">
        {onPrevious ? (
          <Button
            variant="secondary"
            onClick={() => {
              void onPrevious();
            }}
          >
            Anterior
          </Button>
        ) : null}

        <Button
          onClick={() => {
            void onNext();
          }}
          disabled={nextDisabled}
        >
          {nextIcon}
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
