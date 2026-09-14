import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/cn";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClassName = "w-[720px] max-w-[92vw]",
  className,
}: DrawerProps) {
  return (
    <LazyMotion features={domAnimation}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence>
          {open ? (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild>
                <m.div
                  className="fixed bottom-0 left-[var(--sidebar-current-width)] right-0 top-[var(--header-height)] z-50 bg-slate-950/16 transition-[left] duration-200 ease-out motion-reduce:transition-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild>
                <m.aside
                  className={cn(
                    "fixed bottom-0 right-0 top-[var(--header-height)] z-[60] flex flex-col border-l border-slate-200 bg-white shadow-[-16px_0_42px_rgb(15_23_42/0.14)]",
                    widthClassName,
                    className,
                  )}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 34 }}
                >
                  <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0">
                      <DialogPrimitive.Title className="truncate text-lg font-bold text-slate-900">
                        {title}
                      </DialogPrimitive.Title>
                      {description ? (
                        <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
                          {description}
                        </DialogPrimitive.Description>
                      ) : null}
                    </div>
                    <DialogPrimitive.Close asChild>
                      <Button variant="secondary" size="icon" aria-label="Cerrar detalle">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogPrimitive.Close>
                  </header>
                  <div className="min-h-0 flex-1 overflow-y-auto app-scrollbar">{children}</div>
                  {footer ? (
                    <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
                      {footer}
                    </footer>
                  ) : null}
                </m.aside>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </LazyMotion>
  );
}
