const AUTH_APP_URL: string = (() => {
  const value = import.meta.env.VITE_AUTH_APP_URL;

  if (!value) {
    throw new Error("VITE_AUTH_APP_URL es obligatoria para la navegación de autenticación.");
  }

  return value;
})();

const CONFIGURATION_AUTH_RETURN_PATH = "/app/dashboard";

function authAppUrl(pathname: string): URL {
  const configured = new URL(AUTH_APP_URL, window.location.origin);

  return new URL(pathname, configured.origin);
}

export function buildConfigurationAuthReturnUrl(): string {
  return new URL(CONFIGURATION_AUTH_RETURN_PATH, window.location.origin).toString();
}

export function buildAuthLoginUrl(reason?: string): string {
  const url = new URL(AUTH_APP_URL, window.location.origin);

  // El contrato de auth_service autoriza un único callback para Configuración.
  // Nunca se envía la ruta interna actual como return_url.
  url.searchParams.set("return_url", buildConfigurationAuthReturnUrl());

  if (reason) {
    url.searchParams.set("reason", reason);
  }

  return url.toString();
}

export function buildAuthLogoutUrl(reason?: string): string {
  const url = authAppUrl("/cerrar-sesion");

  if (reason) {
    url.searchParams.set("reason", reason);
  }

  return url.toString();
}

export function buildAccessHubUrl(): string {
  return authAppUrl("/accesos").toString();
}

export function redirectToAccessHub() {
  window.location.assign(buildAccessHubUrl());
}

export function redirectToAuthLogin(reason?: string) {
  window.location.replace(buildAuthLoginUrl(reason));
}

export function redirectToAuthLogout(reason?: string) {
  window.location.replace(buildAuthLogoutUrl(reason));
}
