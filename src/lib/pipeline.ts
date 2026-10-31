export const pipelineStages = [
  { id: "nuevo", label: "Nuevos", color: "bg-blue-500" },
  { id: "informado", label: "Contactados", color: "bg-violet-500" },
  { id: "seguimiento", label: "En seguimiento", color: "bg-amber-500" },
  {
    id: "preinscripcion_declarada",
    label: "Preinscripción",
    color: "bg-cyan-500",
  },
  {
    id: "inscripcion_simulada",
    label: "Inscripción simulada",
    color: "bg-emerald-500",
  },
  { id: "sin_interes", label: "Sin interés", color: "bg-slate-400" },
] as const;
export const stageLabel = (stage: string) =>
  pipelineStages.find((s) => s.id === stage)?.label ?? "Nuevos";
