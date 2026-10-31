"use client";
import { DemandOverview } from "./demand-overview";
import type { DemandSelection } from "@/lib/demand";
import {
  Users,
  MessageSquare,
  CalendarClock,
  UserCheck,
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { EmptyState } from "./feedback";
import { pipelineStages, stageLabel } from "@/lib/pipeline";
import { nameOf, initials, date } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { Directory, Followup, Mutation, Status } from "@/lib/types";

export function Overview({
  directory,
  onDemand,
  followup,
  status,
  onOpen,
  navigate,
  onNew,
  act,
  busy,
}: {
  directory: Directory;
  onDemand: (selection: DemandSelection) => void;
  followup?: Followup;
  status?: Status;
  onOpen: (id: string) => void;
  navigate: (view: "contacts" | "chat" | "followup" | "status") => void;
  onNew: () => void;
  act: Mutation;
  busy: boolean;
}) {
  const tasks = (followup?.tasks ?? [])
    .filter((t) => t.status === "pendiente")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const attention = directory.conversations.filter((c) =>
    ["humano", "esperando_humano"].includes(c.mode),
  );
  const pre = directory.contacts.filter(
    (c) => c.pipelineStage === "preinscripcion_declarada",
  );
  const recent = [...directory.contacts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const metrics = [
    {
      label: "Interesados",
      value: directory.contacts.length,
      detail: "En tu espacio de trabajo",
      icon: Users,
      view: "contacts" as const,
    },
    {
      label: "Requieren atención",
      value: attention.length,
      detail: "Conversaciones del equipo",
      icon: MessageSquare,
      view: "chat" as const,
    },
    {
      label: "Tareas pendientes",
      value: tasks.length,
      detail: "Próximos pasos por completar",
      icon: CalendarClock,
      view: "followup" as const,
    },
    {
      label: "Preinscripciones",
      value: pre.length,
      detail: "Declaradas · sin validar",
      icon: UserCheck,
      view: "contacts" as const,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <button
            key={m.label}
            onClick={() => navigate(m.view)}
            className="group rounded-xl border bg-card p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{m.label}</span>
              <m.icon className="size-4" />
            </div>
            <div className="my-3 text-3xl font-semibold tracking-tight tabular-nums">
              {m.value}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{m.detail}</span>
              <ArrowUpRight className="size-3.5 transition group-hover:text-primary" />
            </div>
          </button>
        ))}
      </div>
      <DemandOverview onOpen={onDemand} />
      <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="gap-5 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Admisiones en movimiento</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Distribución actual de interesados
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ver pipeline"
              onClick={() => navigate("contacts")}
            >
              <ArrowUpRight />
            </Button>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage) => {
              const count = directory.contacts.filter(
                (c) => (c.pipelineStage || "nuevo") === stage.id,
              ).length;
              return (
                <div
                  key={stage.id}
                  className="grid grid-cols-[140px_1fr_24px] items-center gap-3 text-xs sm:grid-cols-[155px_1fr_24px]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        stage.color,
                      )}
                    />
                    {stage.label}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        stage.color,
                      )}
                      style={{
                        width: `${directory.contacts.length ? (count / directory.contacts.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={() => navigate("contacts")}
          >
            Gestionar pipeline
            <ArrowRight />
          </Button>
        </Card>
        <Card className="gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Para hoy y lo que sigue</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tus próximos recordatorios
              </p>
            </div>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          {!tasks.length ? (
            <EmptyState
              icon={<CalendarClock />}
              title="Todo al día"
              text="Agregá una tarea desde la ficha de un interesado."
            />
          ) : (
            tasks.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-start gap-3 border-t pt-3">
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="mt-0.5 shrink-0"
                  disabled={busy}
                  aria-label={`Completar ${t.text}`}
                  onClick={() =>
                    void act(
                      `tasks/${t.id}`,
                      { status: "completada" },
                      "PATCH",
                      "Tarea completada",
                    ).catch(() => {})
                  }
                >
                  <Check />
                </Button>
                <button
                  className="min-w-0 flex-1 text-left hover:text-primary"
                  onClick={() => onOpen(t.contactId)}
                >
                  <span className="block truncate text-sm font-medium">
                    {t.text}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {nameOf(
                      directory.contacts.find((c) => c.id === t.contactId),
                    )}{" "}
                    · {date(t.dueAt)}
                  </span>
                </button>
              </div>
            ))
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("followup")}
          >
            Ver seguimiento
            <ArrowRight />
          </Button>
        </Card>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">Últimos interesados</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Los contactos más recientes de tu espacio
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onNew}>
            <Plus />
            Nuevo
          </Button>
        </div>
        {!recent.length ? (
          <EmptyState
            icon={<Users />}
            title="Tu próximo ingreso empieza acá"
            text="Creá el primer interesado para probar el pipeline y la atención."
          />
        ) : (
          recent.map((c) => (
            <button
              key={c.id}
              className="flex w-full items-center gap-3 border-b px-5 py-4 text-left transition-colors last:border-0 hover:bg-muted/50"
              onClick={() => onOpen(c.id)}
            >
              <Avatar>
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {initials(nameOf(c))}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {nameOf(c)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.fields.email ||
                    c.fields.telefono ||
                    "Datos de contacto pendientes"}
                </span>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {stageLabel(c.pipelineStage)}
              </Badge>
              <span className="ml-2 hidden text-xs text-muted-foreground md:inline">
                {date(c.createdAt)}
              </span>
              <ArrowUpRight className="ml-2 size-4 text-muted-foreground" />
            </button>
          ))
        )}
      </Card>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "size-2 rounded-full",
            status?.dispatch_enabled && status.n8n_configured
              ? "bg-emerald-500"
              : "bg-amber-400",
          )}
        />
        {status?.dispatch_enabled && status.n8n_configured
          ? "Agente configurado"
          : "Respuestas automáticas pendientes de conexión"}
        <button
          className="ml-auto underline underline-offset-4 hover:text-primary"
          onClick={() => navigate("status")}
        >
          Ver estado de la demo
        </button>
      </div>
    </div>
  );
}
