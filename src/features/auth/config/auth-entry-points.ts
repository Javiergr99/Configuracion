export const AUTHORIZED_AUTH_ENTRY_PATHS = ["/app/dashboard"] as const;

export type AuthorizedAuthEntryPath = (typeof AUTHORIZED_AUTH_ENTRY_PATHS)[number];

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

export function isAuthorizedAuthEntryPath(pathname: string): pathname is AuthorizedAuthEntryPath {
  const normalizedPathname = normalizePathname(pathname);

  return AUTHORIZED_AUTH_ENTRY_PATHS.some((entryPath) => entryPath === normalizedPathname);
}
