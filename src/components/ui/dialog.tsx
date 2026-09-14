import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClassName = "max-w-xl",
}: DialogProps) {
  return (
    <LazyMotion features={domAnimation}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence>
          {open ? (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild>
                <m.div
                  className="fixed inset-0 z-[90] bg-slate-950/30 backdrop-blur-[1px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild>
                <m.div
                  role="dialog"
                  aria-modal="true"
                  className={`fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] ${widthClassName} -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                      <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                        {title}
                      </DialogPrimitive.Title>
                      {description ? (
                        <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
                          {description}
                        </DialogPrimitive.Description>
                      ) : null}
                    </div>
                    <DialogPrimitive.Close asChild>
                      <Button variant="ghost" size="icon" aria-label="Cerrar ventana">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto px-6 py-5 app-scrollbar">
                    {children}
                  </div>
                  {footer ? (
                    <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                      {footer}
                    </div>
                  ) : null}
                </m.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </LazyMotion>
  );
}
