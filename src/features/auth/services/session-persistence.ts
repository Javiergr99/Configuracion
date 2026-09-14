export type TokenPersistence = "session" | "persistent";

const SESSION_PERSISTENCE_KEY = "ecosistema-configuracion-session-persistence";

function storageFor(persistence: TokenPersistence): Storage {
  return persistence === "persistent" ? localStorage : sessionStorage;
}

function clearMarker() {
  sessionStorage.removeItem(SESSION_PERSISTENCE_KEY);
  localStorage.removeItem(SESSION_PERSISTENCE_KEY);
}

export const sessionPersistence = {
  save(persistence: TokenPersistence) {
    clearMarker();
    storageFor(persistence).setItem(SESSION_PERSISTENCE_KEY, persistence);
  },

  get(): TokenPersistence {
    return localStorage.getItem(SESSION_PERSISTENCE_KEY) === "persistent"
      ? "persistent"
      : "session";
  },

  has(): boolean {
    return Boolean(
      sessionStorage.getItem(SESSION_PERSISTENCE_KEY) ||
      localStorage.getItem(SESSION_PERSISTENCE_KEY),
    );
  },

  clear() {
    clearMarker();
  },
};
