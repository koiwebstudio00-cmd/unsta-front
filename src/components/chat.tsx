"use client";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  ArrowUp,
  MessageSquare,
  Headphones,
  BookOpen,
  RotateCcw,
  UserRound,
  Bot,
  Pause,
  Play,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import type {
  ConversationDetail,
  KnowledgeRecord,
  Status,
  Mutation,
} from "@/lib/types";
import { nameOf, initials, time, modes, areas } from "@/lib/display";
import { Loading, RichText } from "./feedback";
import { cn } from "@/lib/utils";
const senders = {
  user: {
    label: "Interesado",
    icon: UserRound,
    avatar: "bg-muted text-muted-foreground ring-border",
    bubble: "border-border bg-card text-card-foreground",
  },
  assistant: {
    label: "Asistente UNSTA · IA",
    icon: Bot,
    avatar: "bg-primary text-primary-foreground ring-primary/20",
    bubble: "border-primary/15 bg-primary/5 text-foreground dark:bg-primary/10",
  },
  operator: {
    label: "Equipo · atención humana",
    icon: Headphones,
    avatar:
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
    bubble:
      "border-emerald-200 bg-emerald-50/60 text-foreground dark:border-emerald-900 dark:bg-emerald-950/30",
  },
};
const examples = [
  "Quiero estudiar Psicología en Yerba Buena",
  "¿Cuánto cuesta el curso de inglés?",
  "¿Cómo hago la preinscripción?",
];
export function Chat({
  detail,
  loading,
  role,
  setRole,
  status,
  busy,
  act,
  onNew,
  knowledge,
}: {
  detail?: ConversationDetail;
  loading: boolean;
  role: "visitor" | "operator";
  setRole: (role: "visitor" | "operator") => void;
  status?: Status;
  busy: boolean;
  act: Mutation;
  onNew: () => void;
  knowledge: KnowledgeRecord[];
}) {
  const [draft, setDraft] = useState("");
  const pending = useRef<{ text: string; role: string; id: string } | null>(
    null,
  );
  const bottom = useRef<HTMLDivElement>(null);
  const followMessages = useRef(true);
  useEffect(() => {
    if (followMessages.current)
      bottom.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
  }, [detail?.messages.length]);
  const mode = detail?.conversation.mode ?? "bot";
  const online = Boolean(status?.dispatch_enabled && status.n8n_configured);
  const active = detail?.turns.find((t) =>
    ["encolado", "procesando"].includes(t.status),
  );
  const failed =
    detail?.turns[0]?.status === "fallido" ? detail.turns[0] : undefined;
  async function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (
      !detail ||
      !text ||
      busy ||
      mode === "cerrada" ||
      (role === "operator" && mode !== "humano")
    )
      return;
    if (pending.current?.text !== text || pending.current.role !== role)
      pending.current = { text, role, id: crypto.randomUUID() };
    try {
      followMessages.current = true;
      await act(
        `conversations/${detail.conversation.id}/${role === "visitor" ? "messages" : "reply"}`,
        { text, client_message_id: pending.current.id },
        "POST",
        undefined,
      );
      setDraft("");
      pending.current = null;
    } catch {
      /* Keep draft and id for safe retries. */
    }
  }
  const canWrite = Boolean(
    detail && mode !== "cerrada" && (role === "visitor" || mode === "humano"),
  );
  return (
    <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-none border-0 py-0 shadow-none">
      <Tabs
        className="min-h-0 flex-1 gap-0"
        value={role}
        onValueChange={(value) => setRole(value as "visitor" | "operator")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-accent text-xs text-primary dark:text-accent-foreground">
                {detail ? initials(nameOf(detail.contact)) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">
                {detail ? nameOf(detail.contact) : "Elegí una conversación"}
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {modes[mode]}
              </span>
            </div>
          </div>
          <TabsList aria-label="Vista de la conversación">
            <TabsTrigger value="visitor">
              <UserRound />
              Simular consulta
            </TabsTrigger>
            <TabsTrigger value="operator">
              <Headphones />
              Equipo
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={role} className="flex min-h-0 flex-1 flex-col">
          {role === "operator" && detail ? (
            <div className="space-y-2 border-b bg-muted/50 px-4 py-3 text-sm [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2">
              <span>
                {mode === "humano"
                  ? "El asistente está pausado. Podés responder."
                  : mode === "cerrada"
                    ? "Conversación cerrada."
                    : "Tomá el chat para responder personalmente."}
              </span>
              <div>
                {mode !== "humano" ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        `conversations/${detail.conversation.id}/control`,
                        { action: "take" },
                        "POST",
                        "Conversación tomada",
                      ).catch(() => {})
                    }
                  >
                    <Pause size={14} />
                    Tomar chat
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        `conversations/${detail.conversation.id}/control`,
                        { action: "release" },
                        "POST",
                        "Asistente habilitado para mensajes nuevos",
                      ).catch(() => {})
                    }
                  >
                    <Play size={14} />
                    Devolver al asistente
                  </Button>
                )}
                {mode !== "cerrada" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        `conversations/${detail.conversation.id}/control`,
                        { action: "close" },
                        "POST",
                        "Conversación cerrada",
                      ).catch(() => {})
                    }
                  >
                    <CheckCircle size={14} />
                    Cerrar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          {detail?.cases
            .filter((c) => c.status !== "resuelto")
            .map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 border-b bg-muted px-4 py-3 text-sm"
              >
                <Headphones size={16} />
                <span>
                  <strong>{areas[c.area] ?? c.area}</strong> ·{" "}
                  {c.status === "pendiente"
                    ? "En espera del equipo de la demo"
                    : "En atención"}
                  {role === "operator" ? ` · ${c.reason}` : ""}
                </span>
              </div>
            ))}
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/10 p-4 sm:p-6"
            aria-label="Mensajes de la conversación"
            role="log"
            aria-live="polite"
            onScroll={(e) => {
              const node = e.currentTarget;
              followMessages.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 80;
            }}
          >
            {loading ? (
              <Loading label="Cargando conversación…" />
            ) : !detail ? (
              <div className="mx-auto flex min-h-80 max-w-sm flex-col items-center justify-center gap-4 py-8 text-center [&_h3]:text-lg [&_h3]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                  <MessageSquare size={29} strokeWidth={1.4} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  PRIMER CONTACTO
                </span>
                <h3>Todo empieza con una pregunta.</h3>
                <p>
                  Creá una persona de prueba y consultá por una carrera, un
                  curso o el proceso de ingreso.
                </p>
                <Button onClick={onNew} disabled={busy}>
                  Iniciar conversación <ArrowUpRight size={16} />
                </Button>
                <div className="w-full space-y-3 text-left text-sm text-muted-foreground [&_span]:mr-3">
                  {examples.map((q, i) => (
                    <div key={q}>
                      <span>0{i + 1}</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            ) : detail.messages.length === 0 ? (
              <div className="mx-auto flex min-h-80 max-w-sm flex-col items-center justify-center gap-4 py-6 text-center [&_h3]:text-lg [&_h3]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                  <BookOpen size={26} strokeWidth={1.4} />
                </div>
                <h3>
                  {role === "visitor"
                    ? "¿Qué te gustaría conocer?"
                    : "Todavía no hay mensajes"}
                </h3>
                <p>
                  {role === "visitor"
                    ? "Escribí tu consulta o elegí un ejemplo para empezar."
                    : "Simulá una consulta para probar la atención o tomá el chat para escribir desde el equipo."}
                </p>
                {role === "operator" ? (
                  <Button variant="outline" onClick={() => setRole("visitor")}>
                    Simular primera consulta
                  </Button>
                ) : (
                  <div className="grid w-full gap-2">
                    {examples.map((q) => (
                      <Button
                        variant="outline"
                        className="h-auto justify-between whitespace-normal text-left"
                        key={q}
                        onClick={() => setDraft(q)}
                      >
                        {q}
                        <ArrowUpRight size={15} />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 text-center text-[10px] text-muted-foreground">
                  Conversación de prueba · UNSTA
                </div>
                {detail.messages.map((m) => {
                  const visitor = m.role === "user";
                  const sender = senders[m.role];
                  const SenderIcon = sender.icon;
                  const records = knowledge.filter((r) =>
                    m.recordIds.includes(r.id),
                  );
                  const sources = [
                    ...new Map(
                      records.flatMap((r) => r.sources).map((s) => [s.url, s]),
                    ).values(),
                  ];
                  return (
                    <article
                      aria-label={`Mensaje de ${sender.label}`}
                      data-outgoing={role === "visitor" ? visitor : !visitor}
                      className="group mb-6 flex w-fit max-w-[95%] items-start gap-2.5 sm:max-w-[90%] data-[outgoing=true]:ml-auto data-[outgoing=true]:flex-row-reverse motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                      key={m.id}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-6 flex size-8 shrink-0 items-center justify-center rounded-full ring-1",
                          sender.avatar,
                        )}
                      >
                        <SenderIcon className="size-4" />
                      </span>
                      <div className="flex min-w-0 max-w-[40rem] flex-col items-start group-data-[outgoing=true]:items-end">
                        <span className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                          {sender.label}
                        </span>
                        <div
                          className={cn(
                            "min-w-0 max-w-full rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] group-data-[outgoing=true]:rounded-tl-2xl group-data-[outgoing=true]:rounded-tr-sm [&_a]:underline",
                            sender.bubble,
                          )}
                        >
                          <RichText text={m.text} />
                        </div>
                        {sources.length ? (
                          <details className="mt-2 text-xs text-muted-foreground [&_a]:mt-1 [&_a]:flex [&_a]:items-center [&_a]:gap-1 [&_a]:underline">
                            <summary>
                              Fuentes consultadas · {sources.length}
                            </summary>
                            {sources.map((s) => (
                              <a
                                key={s.url}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {s.title}
                                <ArrowUpRight size={12} />
                              </a>
                            ))}
                          </details>
                        ) : null}
                        <time
                          className="mt-1.5 text-[10px] text-muted-foreground"
                          dateTime={m.createdAt}
                        >
                          {time(m.createdAt)}
                        </time>
                      </div>
                    </article>
                  );
                })}
              </>
            )}
            {active ? (
              <div
                className="mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm text-muted-foreground"
                role="status"
              >
                {online ? (
                  <>
                    <Bot className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex gap-1 [&_i]:size-1 [&_i]:rounded-full [&_i]:bg-muted-foreground">
                      <i />
                      <i />
                      <i />
                    </span>
                    {active.status === "procesando"
                      ? "El asistente está preparando su respuesta…"
                      : "Tu mensaje está en espera…"}
                  </>
                ) : (
                  <>
                    <Pause size={15} />
                    <span>
                      Mensaje guardado. La respuesta automática estará
                      disponible cuando se conecte el asistente.
                    </span>
                  </>
                )}
              </div>
            ) : null}
            {failed && !active ? (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-destructive/30 p-3 text-sm">
                <span>No se pudo completar la respuesta automática.</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || !online}
                  onClick={() =>
                    void act(
                      `turns/${failed.id}/retry`,
                      {},
                      "POST",
                      "Reintento solicitado",
                    ).catch(() => {})
                  }
                >
                  <RotateCcw size={14} />
                  Reintentar
                </Button>
              </div>
            ) : null}
            <div ref={bottom} />
          </div>
          {detail ? (
            <form
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-t p-4 [&>span]:col-span-2 [&>span]:text-xs [&>span]:text-muted-foreground"
              onSubmit={send}
            >
              <Label className="sr-only" htmlFor="chat-message">
                {role === "visitor"
                  ? "Mensaje del interesado"
                  : "Respuesta del equipo"}
              </Label>
              <Textarea
                id="chat-message"
                value={draft}
                maxLength={6000}
                rows={2}
                disabled={!canWrite || busy}
                placeholder={
                  mode === "cerrada"
                    ? "La conversación está cerrada"
                    : role === "operator" && mode !== "humano"
                      ? "Tomá el chat para responder"
                      : role === "visitor"
                        ? "Escribí como interesado…"
                        : "Escribí la respuesta del equipo…"
                }
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    void send(e);
                  }
                }}
              />
              <Button
                size="icon"
                aria-label={
                  role === "visitor"
                    ? "Enviar mensaje"
                    : "Enviar respuesta humana"
                }
                disabled={!canWrite || !draft.trim() || busy}
              >
                <ArrowUp size={20} />
              </Button>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {role === "visitor" ? (
                  <UserRound className="size-3.5" aria-hidden="true" />
                ) : (
                  <Headphones className="size-3.5" aria-hidden="true" />
                )}
                <span>
                  {role === "visitor"
                    ? "Escribís como interesado"
                    : "Respondés como equipo"}
                </span>
                <span aria-hidden="true">·</span>
                {busy
                  ? "Enviando…"
                  : "Enter para enviar · Shift + Enter para una nueva línea"}
              </span>
            </form>
          ) : (
            <div className="border-t p-4 text-center text-xs text-muted-foreground">
              Demo de atención · Central y Yerba Buena
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
