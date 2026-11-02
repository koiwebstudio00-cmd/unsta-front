// Shared by server metadata and the panel's query-string navigation.
// Titles never contain names, emails or conversation IDs.
export const pageMetadata = {
  project: {
    title: "Descripción del agente y la plataforma | UNSTA Demo",
    description:
      "Conocé las funcionalidades, los seguimientos y el conocimiento cargado en el proyecto UNSTA. Exportá la descripción en Markdown.",
  },
  home: {
    title: "Resumen de admisiones | UNSTA Demo",
    description:
      "Indicadores de atención, interesados por etapa y próximas tareas del equipo de admisiones en la demo de UNSTA.",
  },
  contacts: {
    title: "Interesados y pipeline de admisiones | UNSTA Demo",
    description:
      "Gestioná interesados, consultá sus datos y propuestas de interés y acompañá su avance por el pipeline de admisiones.",
  },
  chat: {
    title: "Conversaciones con el asistente y el equipo | UNSTA Demo",
    description:
      "Probá el asistente de UNSTA, revisá el historial y continuá la atención humana con el contexto de cada interesado.",
  },
  followup: {
    title: "Seguimiento, tareas y avisos de cursos | UNSTA Demo",
    description:
      "Organizá tareas, atendé derivaciones y probá los avisos internos de apertura de cursos con consentimiento.",
  },
  status: {
    title: "Estado de integraciones y conocimiento | UNSTA Demo",
    description:
      "Revisá la configuración de la demo, sus integraciones y las fuentes, períodos y límites de la base de conocimiento.",
  },
} as const;

export type PanelView = keyof typeof pageMetadata;
export function panelView(value: unknown): PanelView {
  return typeof value === "string" && Object.hasOwn(pageMetadata, value)
    ? (value as PanelView)
    : "home";
}
