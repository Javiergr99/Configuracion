import { Suspense, type ReactNode } from "react";

function RouteChunkFallback() {
  return (
    <div className="grid min-h-[42vh] place-items-center px-6" role="status" aria-live="polite">
      <div className="text-center">
        <span
          className="mx-auto block h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--ui-border)] border-t-[var(--ui-primary)]"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium text-[var(--ui-text-secondary)]">Cargando módulo…</p>
      </div>
    </div>
  );
}

export function DeferredRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteChunkFallback />}>{children}</Suspense>;
}
