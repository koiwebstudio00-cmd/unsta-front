import type { Contact, Interest, Proposal } from "./types";
export const stages: Record<string, string> = {
  nuevo: "Nuevo interés",
  informado: "Información enviada",
  seguimiento: "En seguimiento",
  preinscripcion_declarada: "Preinscripción declarada",
  inscripcion_simulada: "Inscripción simulada",
  sin_interes: "Sin interés",
};
export const modes: Record<string, string> = {
  bot: "Asistente",
  esperando_humano: "Espera atención",
  humano: "Atención humana",
  cerrada: "Cerrada",
};
export const areas: Record<string, string> = {
  admisiones: "Admisiones",
  alumnos: "Alumnos",
  idiomas: "Idiomas",
  orientacion_vocacional: "Orientación vocacional",
  tesoreria: "Tesorería",
};
export const campus: Record<string, string> = {
  central: "Central",
  yerba_buena: "Yerba Buena",
};
export const nameOf = (contact?: Contact) =>
  contact?.fields.nombre || "Persona sin identificar";
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
export const proposalName = (id: string | undefined, catalog: Proposal[]) =>
  catalog.find((p) => p.id === id)?.titulo ?? "Propuesta por confirmar";
export const interestName = (i: Interest, catalog: Proposal[]) =>
  i.data.propuesta_libre ?? proposalName(i.data.propuesta_id, catalog);
export const date = (value: string, withTime = false) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Argentina/Tucuman",
  }).format(new Date(value));
export const time = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Tucuman",
  }).format(new Date(value));
