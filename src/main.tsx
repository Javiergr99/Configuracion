import "./shared/navigation/scroll-reset";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "sonner";

import { queryClient } from "@/app/providers/query-client";
import { router } from "@/app/router/router";
import "@/app/styles/index.css";
import { AppearanceRuntimeProvider } from "@/features/appearance-settings/components/appearance-runtime-provider";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento raíz de la aplicación.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppearanceRuntimeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <TooltipProvider delayDuration={250}>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </AppearanceRuntimeProvider>
  </StrictMode>,
);
