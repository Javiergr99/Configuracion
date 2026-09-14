import { QueryClient } from "@tanstack/react-query";

// La configuración central evita políticas distintas de caché entre módulos.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
