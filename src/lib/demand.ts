export type DemandFilters = {
  days: "all" | "7" | "30" | "90";
  sede: "all" | "central" | "yerba_buena";
  kind: "all" | "carreras" | "cursos";
};
export type DemandSelection = DemandFilters & {
  proposalId: string;
  pending: boolean;
};
export type DemandData = {
  people: number;
  unmappedPeople: number;
  generatedAt: string;
  rows: {
    proposalId: string;
    title: string;
    kind: string;
    interested: number;
    pending: number;
  }[];
};
export const demandPeriods = {
  all: "Todo el período",
  "7": "Últimos 7 días",
  "30": "Últimos 30 días",
  "90": "Últimos 90 días",
};
export function demandQuery(filters: DemandFilters) {
  return new URLSearchParams({
    days: filters.days,
    sede: filters.sede,
    kind: filters.kind,
  }).toString();
}
export function demandSelection(
  params: Record<string, string | string[] | undefined>,
): DemandSelection | null {
  if (
    typeof params.propuesta !== "string" ||
    !/^(carrera|curso|diplomatura)-[a-z0-9-]+$/.test(params.propuesta)
  )
    return null;
  return {
    proposalId: params.propuesta,
    pending: params.pendientes === "true",
    days: ["7", "30", "90"].includes(String(params.dias))
      ? (params.dias as DemandFilters["days"])
      : "all",
    sede: ["central", "yerba_buena"].includes(String(params.sede))
      ? (params.sede as DemandFilters["sede"])
      : "all",
    kind: ["carreras", "cursos"].includes(String(params.tipo))
      ? (params.tipo as DemandFilters["kind"])
      : "all",
  };
}
