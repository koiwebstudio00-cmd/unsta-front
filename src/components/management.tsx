"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";

import { useState, type FormEvent } from "react";
import {
  Users,
  Check,
  CalendarDays,
  Headphones,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import type {
  Directory,
  Proposal,
  Followup as FollowupData,
  Mutation,
  Status,
  KnowledgeRecord,
} from "@/lib/types";
import { nameOf, date, proposalName, areas } from "@/lib/display";
import { EmptyState } from "./feedback";
export function FollowupView({
  data,
  directory,
  catalog,
  act,
  busy,
  onConversation,
}: {
  data: FollowupData;
  directory: Directory;
  catalog: Proposal[];
  act: Mutation;
  busy: boolean;
  onConversation: (id: string) => void;
}) {
  const [proposal, setProposal] = useState("");
  const [section, setSection] = useState("tasks");
  const tasks = data.tasks.filter((t) => t.status === "pendiente");
  const subs = data.subscriptions.filter(
    (s) => s.status === "activa" && (!proposal || s.proposalId === proposal),
  );
  const contact = (id: string) =>
    nameOf(directory.contacts.find((c) => c.id === id));
  async function opening(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      await act(
        "openings",
        { proposal_id: f.get("proposal"), description: f.get("description") },
        "POST",
        "Apertura de prueba encolada",
      );
      form.reset();
    } catch {}
  }
  return (
    <div className="space-y-4">
      <Tabs value={section} onValueChange={setSection}>
        <TabsList aria-label="Vista de seguimiento">
          <TabsTrigger value="tasks">Tareas y atención</TabsTrigger>
          <TabsTrigger value="notices">Avisos de cursos</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {section === "tasks" ? (
          <>
            <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
              <div className="flex items-center gap-2 [&>h2]:font-semibold [&>svg]:size-4 [&>[data-slot=badge]]:ml-auto">
                <CalendarDays size={19} />
                <h2>Próximas tareas</h2>
                <Badge>{tasks.length}</Badge>
              </div>
              {!tasks.length ? (
                <EmptyState
                  title="Sin tareas pendientes"
                  text="Podés crear recordatorios desde la ficha de cada interesado."
                />
              ) : (
                tasks.map((t) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground [&_small]:text-xs [&_small]:text-muted-foreground"
                    key={t.id}
                  >
                    <div>
                      <strong>{t.text}</strong>
                      <p>
                        {contact(t.contactId)} · {date(t.dueAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
                        <Check size={17} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            `tasks/${t.id}`,
                            { status: "cancelada" },
                            "PATCH",
                            "Tarea cancelada",
                          ).catch(() => {})
                        }
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </Card>
            <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
              <div className="flex items-center gap-2 [&>h2]:font-semibold [&>svg]:size-4 [&>[data-slot=badge]]:ml-auto">
                <Headphones size={19} />
                <h2>Atención del equipo</h2>
              </div>
              {!data.cases.filter((c) => c.status !== "resuelto").length ? (
                <EmptyState
                  title="No hay derivaciones abiertas"
                  text="Las consultas que necesiten intervención humana se reúnen acá."
                />
              ) : (
                data.cases
                  .filter((c) => c.status !== "resuelto")
                  .map((c) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground [&_small]:text-xs [&_small]:text-muted-foreground"
                      key={c.id}
                    >
                      <div>
                        <strong>{areas[c.area] ?? c.area}</strong>
                        <p>{c.reason}</p>
                        <small>{c.summary}</small>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConversation(c.conversationId)}
                      >
                        Abrir chat
                      </Button>
                    </div>
                  ))
              )}
            </Card>
          </>
        ) : (
          <>
            <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
              <div className="flex items-center gap-2 [&>h2]:font-semibold [&>svg]:size-4 [&>[data-slot=badge]]:ml-auto">
                <Users size={19} />
                <h2>Esperan una apertura</h2>
                <Badge>{subs.length}</Badge>
              </div>
              <NativeSelect
                aria-label="Filtrar avisos por curso"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
              >
                <NativeSelectOption value="">
                  Todos los cursos
                </NativeSelectOption>
                {catalog
                  .filter((p) => !p.id.startsWith("carrera-"))
                  .map((p) => (
                    <NativeSelectOption key={p.id} value={p.id}>
                      {p.titulo}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
              {!subs.length ? (
                <EmptyState
                  title="Sin avisos solicitados"
                  text="No hay solicitudes activas para este filtro. Podés pedir un aviso simulado desde el chat y confirmar el curso."
                />
              ) : (
                subs.map((s) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground [&_small]:text-xs [&_small]:text-muted-foreground"
                    key={s.id}
                  >
                    <div>
                      <strong>{contact(s.contactId)}</strong>
                      <p>{proposalName(s.proposalId, catalog)}</p>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void act(
                          `subscriptions/${s.id}/cancel`,
                          {},
                          "POST",
                          "Suscripción cancelada",
                        ).catch(() => {})
                      }
                    >
                      Cancelar
                    </Button>
                  </div>
                ))
              )}
            </Card>
            <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
              <div className="flex items-center gap-2 [&>h2]:font-semibold [&>svg]:size-4 [&>[data-slot=badge]]:ml-auto">
                <BookOpen size={19} />
                <h2>Simular una apertura</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Creá un evento de prueba para quienes pidieron un aviso. n8n
                procesa la apertura y su estado aparece debajo. Los avisos se
                guardan en el panel; no se envían por WhatsApp ni email.
              </p>
              <form
                className="grid gap-3 [&_label]:grid [&_label]:gap-2 [&_button]:justify-self-start [&_[data-slot=native-select-wrapper]]:w-full"
                onSubmit={opening}
              >
                <Label>
                  Curso
                  <NativeSelect
                    aria-label="Curso"
                    name="proposal"
                    required
                    defaultValue=""
                  >
                    <NativeSelectOption value="" disabled>
                      Elegir propuesta
                    </NativeSelectOption>
                    {catalog
                      .filter((p) => !p.id.startsWith("carrera-"))
                      .map((p) => (
                        <NativeSelectOption key={p.id} value={p.id}>
                          {p.titulo}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                </Label>
                <Label>
                  Descripción de prueba
                  <Textarea
                    name="description"
                    maxLength={2000}
                    rows={2}
                    placeholder="Ej. Nueva edición de prueba para marzo"
                    required
                  />
                </Label>
                <Button variant="outline" disabled={busy}>
                  Crear apertura simulada
                </Button>
              </form>
              {data.events.map((e) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground [&_small]:text-xs [&_small]:text-muted-foreground"
                  key={e.id}
                >
                  <div>
                    <strong>{proposalName(e.proposalId, catalog)}</strong>
                    <p>{e.description}</p>
                  </div>
                  <Badge>{e.status}</Badge>
                </div>
              ))}
            </Card>
            <Card className="gap-4 p-4 lg:col-span-2">
              <div className="flex items-center gap-2 [&>h2]:font-semibold [&>svg]:size-4 [&>[data-slot=badge]]:ml-auto">
                <h2>Avisos simulados generados</h2>
                <Badge>{data.notices.length}</Badge>
              </div>
              {!data.notices.length ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no se generaron avisos.
                </p>
              ) : (
                data.notices.map((n) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground [&_small]:text-xs [&_small]:text-muted-foreground"
                    key={n.id}
                  >
                    <div>
                      <strong>{contact(n.contactId)}</strong>
                      <p>{n.text}</p>
                    </div>
                    <small>{date(n.createdAt, true)}</small>
                  </div>
                ))
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
export function StatusView({
  status,
  catalog,
  knowledge,
}: {
  status: Status;
  catalog: Proposal[];
  knowledge: KnowledgeRecord[];
}) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
        <span className="text-xs font-medium text-muted-foreground">
          ALCANCE DE ESTA VERSIÓN
        </span>
        <h2>Un recorrido conectado, paso a paso.</h2>
        <p>
          El panel y el guardado de datos funcionan localmente. La atención
          automática requiere importar los workflows, configurar sus
          credenciales y comprobar una ejecución completa en n8n.
        </p>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground">
          <div>
            <strong>Panel y base de datos</strong>
            <p>Acceso con email y contraseña, conversaciones y seguimiento.</p>
          </div>
          <Badge variant="secondary">Disponible</Badge>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground">
          <div>
            <strong>Base de conocimiento</strong>
            <p>
              {status.records} registros · {catalog.length} propuestas ·{" "}
              {status.knowledge_version}
            </p>
          </div>
          <Badge variant="secondary">Cargada</Badge>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground">
          <div>
            <strong>Conexión con n8n</strong>
            <p>
              {status.n8n_configured
                ? "Direcciones de ejecución configuradas."
                : "Pendiente de configurar los workflows remotos."}
            </p>
          </div>
          <Badge variant="outline">
            {status.n8n_configured ? "Configurada" : "Pendiente"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground">
          <div>
            <strong>Respuestas automáticas</strong>
            <p>
              {status.dispatch_enabled
                ? "Despacho habilitado. La configuración no prueba una ejecución real."
                : "Despacho desactivado. Los mensajes se guardan sin llamar al modelo."}
            </p>
          </div>
          <Badge variant="outline">
            {status.dispatch_enabled ? "Habilitadas" : "En espera"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm [&_p]:mt-1 [&_p]:text-muted-foreground">
          <div>
            <strong>Verificación del agente en vivo</strong>
            <p>
              Requiere una conversación completa con el modelo y sus
              herramientas.
            </p>
          </div>
          <Badge variant="outline">
            {status.n8n_live_verified ? "Verificada" : "Pendiente"}
          </Badge>
        </div>
      </Card>
      <Card className="gap-4 p-4 [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
        <h2>Información con contexto</h2>
        <p>
          Recorte de la oferta de Central y Yerba Buena. Los aranceles, horarios
          y fechas conservan el período publicado y sus condiciones; requieren
          validación institucional antes de uso público.
        </p>
        <Accordion type="multiple" className="max-h-[600px] overflow-y-auto">
          {knowledge.map((r) => (
            <AccordionItem value={r.id} key={r.id}>
              <AccordionTrigger>
                <span className="text-left">
                  {r.title}
                  {r.period ? (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {r.period}
                    </span>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:underline">
                {r.conditions.map((c, i) => (
                  <p className="text-xs" key={i}>
                    {c}
                  </p>
                ))}
                {r.sources.map((s) => (
                  <a
                    href={s.url}
                    key={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.title}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
