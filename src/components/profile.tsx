"use client";
import { useState, type FormEvent } from "react";
import {
  Pencil,
  UserRound,
  Plus,
  Mail,
  Phone,
  CalendarDays,
  Check,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import type { Profile as ProfileData, Proposal, Mutation } from "@/lib/types";
import {
  nameOf,
  initials,
  interestName,
  stages,
  campus,
  date,
  proposalName,
} from "@/lib/display";
import { stageLabel } from "@/lib/pipeline";
import { EmptyState, Loading } from "./feedback";
export function Profile({
  data,
  catalog,
  operator,
  busy,
  act,
  loading,
}: {
  data?: ProfileData;
  catalog: Proposal[];
  operator: boolean;
  busy: boolean;
  act: Mutation;
  loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [noteForm, setNoteForm] = useState(false);
  const [taskForm, setTaskForm] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;
    const fields = Object.fromEntries(
      [...new FormData(e.currentTarget)]
        .filter(([, v]) => String(v).trim())
        .map(([k, v]) => [k, String(v).trim()]),
    );
    try {
      await act(
        `contacts/${data.contact.id}`,
        fields,
        "PATCH",
        "Datos actualizados",
      );
      setEditing(false);
    } catch {}
  }
  async function add(e: FormEvent<HTMLFormElement>, kind: "notes" | "tasks") {
    e.preventDefault();
    if (!data) return;
    const f = new FormData(e.currentTarget);
    const body =
      kind === "notes"
        ? { text: f.get("text") }
        : {
            text: f.get("text"),
            due_at: new Date(`${f.get("due")}T12:00:00-03:00`).toISOString(),
          };
    try {
      await act(
        `contacts/${data.contact.id}/${kind}`,
        body,
        "POST",
        kind === "notes" ? "Nota guardada" : "Tarea creada",
      );
      if (kind === "notes") setNoteForm(false);
      else setTaskForm(false);
    } catch {}
  }
  if (loading) return <Loading label="Cargando ficha…" />;
  if (!data)
    return (
      <EmptyState
        icon={<UserRound />}
        title="Información del interesado"
        text="Elegí una conversación para ver sus datos y próximos pasos."
      />
    );
  return (
    <div className="min-w-0 bg-card text-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-xs font-semibold">Información del interesado</h2>
        {operator && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Editar datos"
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-accent text-accent-foreground">
              {initials(nameOf(data.contact))}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="break-words font-semibold">
              {nameOf(data.contact)}
            </h3>
            <span className="text-xs text-muted-foreground">
              {data.contact.fields.condicion || "Interesado"}
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="mt-4">
          {stageLabel(data.contact.pipelineStage)}
        </Badge>
        <dl className="mt-5 space-y-4 text-xs">
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="mb-1 text-[10px] text-muted-foreground">Email</dt>
              <dd className="break-all">
                {data.contact.fields.email || "Sin registrar"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="mb-1 text-[10px] text-muted-foreground">
                Teléfono
              </dt>
              <dd>{data.contact.fields.telefono || "Sin registrar"}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="mb-1 text-[10px] text-muted-foreground">
                Primer contacto
              </dt>
              <dd>{date(data.contact.createdAt, true)}</dd>
            </div>
          </div>
        </dl>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["notes"]}
        className="border-t px-5"
      >
        <AccordionItem value="interests">
          <AccordionTrigger className="text-xs">
            Propuestas de interés{" "}
            <span className="ml-auto text-muted-foreground">
              {data.interests.length}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {!data.interests.length ? (
              <p className="text-xs text-muted-foreground">
                El asistente registrará las propuestas mencionadas en la
                conversación.
              </p>
            ) : (
              data.interests.map((i) => (
                <div key={i.id} className="space-y-2 rounded-lg border p-3">
                  <h4 className="text-xs font-medium">
                    {interestName(i, catalog)}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {[
                      campus[i.data.sede ?? ""],
                      i.data.modalidad,
                      i.data.periodo,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Sede por confirmar"}
                  </p>
                  {operator ? (
                    <NativeSelect
                      className="text-xs"
                      aria-label={`Etapa de propuesta ${interestName(i, catalog)}`}
                      value={i.stage}
                      disabled={busy}
                      onChange={(e) =>
                        void act(
                          `interests/${i.id}`,
                          { stage: e.target.value },
                          "PATCH",
                          "Etapa de la propuesta actualizada",
                        ).catch(() => {})
                      }
                    >
                      {Object.entries(stages).map(([v, t]) => (
                        <NativeSelectOption key={v} value={v}>
                          {t}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  ) : (
                    <Badge variant="outline">{stages[i.stage]}</Badge>
                  )}
                </div>
              ))
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="notes">
          <AccordionTrigger className="text-xs">
            Notas internas{" "}
            <span className="ml-auto text-muted-foreground">
              {data.notes.length}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {!data.notes.length && !noteForm && (
              <p className="text-xs text-muted-foreground">
                Sumá contexto para el próximo contacto.
              </p>
            )}
            {[...data.notes].reverse().map((n) => (
              <div key={n.id} className="rounded-lg bg-muted/60 p-3">
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                  {n.text}
                </p>
                <time className="mt-2 block text-[10px] text-muted-foreground">
                  {date(n.createdAt, true)}
                </time>
              </div>
            ))}
            {operator &&
              (noteForm ? (
                <form
                  onSubmit={(e) => void add(e, "notes")}
                  className="space-y-2"
                >
                  <Label className="sr-only" htmlFor="internal-note">
                    Nota interna
                  </Label>
                  <Textarea
                    id="internal-note"
                    name="text"
                    required
                    maxLength={6000}
                    rows={3}
                    autoFocus
                    placeholder="Escribí una nota para el equipo…"
                    disabled={busy}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy}>
                      Guardar nota
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Cancelar nota"
                      disabled={busy}
                      onClick={() => setNoteForm(false)}
                    >
                      <X />
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 text-primary dark:text-foreground"
                  onClick={() => setNoteForm(true)}
                >
                  <Plus />
                  Agregar nota
                </Button>
              ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tasks">
          <AccordionTrigger className="text-xs">
            Tareas{" "}
            <span className="ml-auto text-muted-foreground">
              {data.tasks.filter((t) => t.status === "pendiente").length}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {data.tasks
              .filter((t) => t.status === "pendiente")
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-xs">{t.text}</p>
                    <time className="text-[10px] text-muted-foreground">
                      {date(t.dueAt)}
                    </time>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Completar ${t.text}`}
                    disabled={busy}
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
                </div>
              ))}
            {operator &&
              (taskForm ? (
                <form
                  onSubmit={(e) => void add(e, "tasks")}
                  className="space-y-3"
                >
                  <Label htmlFor="task-text">Recordatorio</Label>
                  <Input
                    id="task-text"
                    name="text"
                    required
                    maxLength={500}
                    placeholder="Ej. Consultar por la preinscripción"
                    disabled={busy}
                  />
                  <Label htmlFor="task-due">Fecha</Label>
                  <Input
                    id="task-due"
                    name="due"
                    type="date"
                    required
                    disabled={busy}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy}>
                      Crear tarea
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label="Cancelar tarea"
                      disabled={busy}
                      onClick={() => setTaskForm(false)}
                    >
                      <X />
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 text-primary dark:text-foreground"
                  onClick={() => setTaskForm(true)}
                >
                  <Plus />
                  Nueva tarea
                </Button>
              ))}
          </AccordionContent>
        </AccordionItem>
        {data.subscriptions.length > 0 && (
          <AccordionItem value="notices">
            <AccordionTrigger className="text-xs">
              Avisos solicitados
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {data.subscriptions.map((s) => (
                <div className="text-xs" key={s.id}>
                  <p>{proposalName(s.proposalId, catalog)}</p>
                  <span className="text-muted-foreground">
                    {s.status === "activa"
                      ? "Espera una apertura"
                      : "Cancelado"}
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      <Dialog
        open={editing}
        onOpenChange={(value) => {
          if (!busy) setEditing(value);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar interesado</DialogTitle>
            <DialogDescription>
              Los cambios se guardan en la ficha. Los campos vacíos conservan su
              valor anterior.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={save} key={data.contact.id}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                name="nombre"
                defaultValue={data.contact.fields.nombre}
                maxLength={200}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={data.contact.fields.email}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                name="telefono"
                defaultValue={data.contact.fields.telefono}
                minLength={6}
                maxLength={40}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condición</Label>
              <NativeSelect
                id="edit-condition"
                name="condicion"
                defaultValue={data.contact.fields.condicion ?? ""}
                disabled={busy}
              >
                <NativeSelectOption value="">Por confirmar</NativeSelectOption>
                <NativeSelectOption value="ingresante">
                  Ingresante
                </NativeSelectOption>
                <NativeSelectOption value="alumno">Alumno</NativeSelectOption>
                <NativeSelectOption value="otro">Otro</NativeSelectOption>
              </NativeSelect>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button disabled={busy}>
                {busy ? "Guardando…" : "Guardar datos"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
