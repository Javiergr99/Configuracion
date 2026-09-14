export type PermissionGroupPresentation = {
  title: string;
  scope?: string;
  technicalName: string;
  family: string;
};

const PRESENTATIONS: Record<string, Omit<PermissionGroupPresentation, "technicalName">> = {
  MESA_AYUDA: {
    title: "Mesa de Ayuda",
    scope: "Registro, seguimiento y administración de atenciones",
    family: "mesa-ayuda",
  },
  FORMATOS_ATENCIONES: {
    title: "Formato de NNA",
    scope: "Captura, consulta y gestión de formatos de atención",
    family: "formato-nna",
  },
  DIRECTORIO_PROCURADORES: {
    title: "Directorio de Procuradores",
    scope: "Administración del directorio institucional",
    family: "directorio-procuradores",
  },
  CONTROL_AGENDA_NACIONAL: {
    title: "Control Agenda Nacional",
    scope: "Acceso general al sistema",
    family: "control-agenda",
  },
  SEMAFORO_ADMIN: {
    title: "Control Agenda Nacional",
    scope: "Administrador global",
    family: "control-agenda",
  },
  SEMAFORO_DGRJRDNNA: {
    title: "Control Agenda Nacional",
    scope: "DGRJRDNNA",
    family: "control-agenda",
  },
  SEMAFORO_DGRCAS: {
    title: "Control Agenda Nacional",
    scope: "DGRCAS",
    family: "control-agenda",
  },
  SEMAFORO_DGNPDDNNA: {
    title: "Control Agenda Nacional",
    scope: "DGNPDDNNA",
    family: "control-agenda",
  },
  SEMAFORO_DGCP: {
    title: "Control Agenda Nacional",
    scope: "DGCP",
    family: "control-agenda",
  },
  CRONOS: {
    title: "CRONOS",
    scope: "Gestión de jornada y personal",
    family: "cronos",
  },
};

function humanizeTechnicalName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase("es-MX")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("es-MX") + part.slice(1))
    .join(" ");
}

export function getPermissionGroupPresentation(name: string): PermissionGroupPresentation {
  const normalized = name.trim().toUpperCase();
  const known = PRESENTATIONS[normalized];

  if (known) {
    return { ...known, technicalName: normalized };
  }

  return {
    title: humanizeTechnicalName(normalized),
    technicalName: normalized,
    family: normalized.toLocaleLowerCase("es-MX"),
  };
}

export function permissionGroupSearchText(name: string, description?: string): string {
  const presentation = getPermissionGroupPresentation(name);
  return [presentation.title, presentation.scope, presentation.technicalName, description]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("es-MX");
}

export function getPermissionGroupDisplayLabel(name: string): string {
  const presentation = getPermissionGroupPresentation(name);
  return presentation.scope ? `${presentation.title} — ${presentation.scope}` : presentation.title;
}
