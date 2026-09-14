const URL_KEYS = ["VITE_API_URL", "VITE_AUTH_APP_URL"];
export const REQUIRED_KEYS = [...URL_KEYS];

export function parseEnv(text) {
  const result = {};

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

export function validateProductionEnv(env) {
  const errors = [];

  for (const key of REQUIRED_KEYS) {
    if (!env[key]?.trim()) {
      errors.push(`${key}: variable requerida vacía`);
    }
  }

  for (const key of URL_KEYS) {
    const value = env[key]?.trim();
    if (!value) continue;

    let url;
    try {
      url = new URL(value);
    } catch {
      errors.push(`${key}: URL inválida`);
      continue;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`${key}: solo se permite http/https`);
    }

    if (url.username || url.password) {
      errors.push(`${key}: no debe contener credenciales embebidas`);
    }

    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "::1" || /^127(?:\.\d{1,3}){3}$/u.test(host)) {
      errors.push(`${key}: no puede apuntar a localhost/loopback en producción`);
    }

    if (value.endsWith("/")) {
      errors.push(`${key}: no debe terminar con slash`);
    }
  }

  if ((env.VITE_ENABLE_ADMIN_MOCKS ?? "false").trim().toLowerCase() !== "false") {
    errors.push("VITE_ENABLE_ADMIN_MOCKS: debe ser false en producción");
  }

  return errors;
}
