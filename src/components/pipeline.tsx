"use client";
import { useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  rectIntersection,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  GripVertical,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Mail,
  Phone,
  MoreHorizontal,
  ArrowUpRight,
  LoaderCircle,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "./ui/table";
import { EmptyState } from "./feedback";
import type { Contact, Directory, Proposal } from "@/lib/types";
import { initials, nameOf, interestName, date, campus } from "@/lib/display";
import { pipelineStages } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

// One arrow key moves to the next stage, including empty columns.
const stageCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.code)) return;
  event.preventDefault();
  const lanes = [...context.droppableRects.entries()].sort(
    (a, b) => a[1].left - b[1].left,
  );
  const current = lanes.findIndex(([id]) => id === context.over?.id);
  const index =
    current < 0
      ? lanes.findIndex(
          ([, rect]) =>
            currentCoordinates.x >= rect.left &&
            currentCoordinates.x <= rect.right,
        )
      : current;
  const next = lanes[index + (event.code === "ArrowRight" ? 1 : -1)]?.[1];
  return next ? { x: next.left + 20, y: next.top + 65 } : undefined;
};

function Lane({
  stage,
  count,
  children,
}: {
  stage: (typeof pipelineStages)[number];
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <section
      ref={setNodeRef}
      aria-label={`Etapa ${stage.label}`}
      className={cn(
        "flex h-full min-h-0 min-w-[264px] flex-1 basis-[264px] flex-col overflow-hidden rounded-xl border border-transparent bg-muted/55 p-2 transition-colors",
        isOver && "border-primary/40 bg-accent ring-2 ring-primary/10",
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-2 py-3">
        <span className={cn("size-2 rounded-full", stage.color)} />
        <h2 className="text-xs font-semibold">{stage.label}</h2>
        <span className="ml-auto rounded-md bg-background px-1.5 py-0.5 text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      <div
        role="region"
        aria-label={`Interesados en ${stage.label}`}
        tabIndex={0}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-lg p-0.5 [scrollbar-gutter:stable] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
        {!count && (
          <div className="flex min-h-36 flex-1 items-center justify-center rounded-lg border border-dashed px-4 text-center text-xs text-muted-foreground">
            {isOver ? "Soltá para mover aquí" : "Arrastrá un interesado aquí"}
          </div>
        )}
      </div>
    </section>
  );
}

function LeadCard({
  contact,
  summary,
  onOpen,
  onMove,
  busy,
  overlay = false,
}: {
  contact: Contact;
  summary: string;
  onOpen: (id: string) => void;
  onMove: (id: string, stage: string) => void;
  busy: boolean;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: overlay ? `preview-${contact.id}` : contact.id,
      disabled: busy || overlay,
    });
  return (
    <article
      aria-hidden={overlay || undefined}
      inert={overlay || undefined}
      ref={overlay ? undefined : setNodeRef}
      className={cn(
        "group shrink-0 rounded-lg border bg-card p-3 shadow-xs transition-[box-shadow,opacity,border-color] hover:border-primary/25 hover:shadow-md",
        isDragging && "opacity-25",
        overlay && "rotate-2 shadow-xl ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-start gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-[11px] text-accent-foreground">
            {initials(nameOf(contact))}
          </AvatarFallback>
        </Avatar>
        <button
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          onClick={() => onOpen(contact.id)}
          aria-label={`Abrir ficha de ${nameOf(contact)}`}
        >
          <span className="block truncate text-xs font-semibold group-hover:text-primary">
            {nameOf(contact)}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            Ingreso · {date(contact.createdAt)}
          </span>
        </button>
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={busy}
          aria-label={`Arrastrar ${nameOf(contact)}`}
          className="touch-none rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-grab active:cursor-grabbing disabled:cursor-wait"
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-2">
          <Mail className="size-3 shrink-0" />
          <span className="truncate">
            {contact.fields.email || "Email pendiente"}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-3 shrink-0" />
          <span>{contact.fields.telefono || "Teléfono pendiente"}</span>
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t pt-2">
        <span
          className="truncate text-[10px] text-muted-foreground"
          title={summary}
        >
          {summary}
        </span>
        {busy ? (
          <LoaderCircle className="ml-auto size-4 shrink-0 animate-spin text-primary" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto shrink-0"
                aria-label={`Opciones de ${nameOf(contact)}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onOpen(contact.id)}>
                <ArrowUpRight />
                Abrir conversación
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Mover a</DropdownMenuLabel>
              {pipelineStages.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  disabled={s.id === contact.pipelineStage}
                  onSelect={() => onMove(contact.id, s.id)}
                >
                  <span className={cn("size-2 rounded-full", s.color)} />
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </article>
  );
}

export function Pipeline({
  data,
  catalog,
  onOpen,
  onMove,
  moving,
}: {
  data: Directory;
  catalog: Proposal[];
  onOpen: (id: string) => void;
  onMove: (id: string, stage: string) => void;
  moving: string | null;
}) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("board");
  const [filters, setFilters] = useState(false);
  const [proposal, setProposal] = useState("");
  const [sede, setSede] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: stageCoordinates }),
  );
  const contacts = data.contacts.filter((c) => {
    const interests = data.interests.filter((i) => i.contactId === c.id);
    return (
      [nameOf(c), c.fields.email, c.fields.telefono]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (!proposal || interests.some((i) => i.data.propuesta_id === proposal)) &&
      (!sede || interests.some((i) => i.data.sede === sede))
    );
  });
  const summary = (id: string) =>
    data.interests
      .filter((i) => i.contactId === id)
      .map((i) => interestName(i, catalog))
      .join(" · ") || "Interés por definir";
  const dragged = data.contacts.find((c) => c.id === active);
  function dropped({ active, over }: DragEndEvent) {
    setActive(null);
    const contact = data.contacts.find((c) => c.id === active.id);
    if (
      contact &&
      over &&
      pipelineStages.some((s) => s.id === over.id) &&
      contact.pipelineStage !== over.id
    )
      onMove(contact.id, String(over.id));
  }
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b pb-4">
        <Tabs value={view} onValueChange={setView}>
          <TabsList aria-label="Vista de interesados">
            <TabsTrigger value="board">
              <LayoutGrid />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="list">
              <List />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-xs text-muted-foreground">
          {contacts.length} interesados
        </span>
        <div className="relative min-w-44 flex-1 sm:ml-auto sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Buscar interesados"
            placeholder="Buscar nombre, email o teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={filters || proposal || sede ? "secondary" : "outline"}
          onClick={() => setFilters(!filters)}
          aria-expanded={filters}
        >
          <SlidersHorizontal />
          Filtros
          {proposal || sede ? (
            <Badge>{Number(Boolean(proposal)) + Number(Boolean(sede))}</Badge>
          ) : null}
        </Button>
      </div>
      {filters && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-top-1">
          <NativeSelect
            aria-label="Filtrar por propuesta"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
          >
            <NativeSelectOption value="">
              Todas las propuestas
            </NativeSelectOption>
            {catalog.map((p) => (
              <NativeSelectOption key={p.id} value={p.id}>
                {p.titulo}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Filtrar por sede"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          >
            <NativeSelectOption value="">Todas las sedes</NativeSelectOption>
            {Object.entries(campus).map(([id, label]) => (
              <NativeSelectOption key={id} value={id}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSede("");
              setProposal("");
              setSearch("");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
      {view === "board" ? (
        <>
          <DndContext
            id="lead-pipeline"
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={(e) => setActive(String(e.active.id))}
            onDragEnd={dropped}
            onDragCancel={() => setActive(null)}
            accessibility={{
              screenReaderInstructions: {
                draggable:
                  "Presioná espacio para arrastrar. Usá las flechas izquierda y derecha para cambiar de etapa, espacio para soltar y Escape para cancelar. También podés usar el menú de opciones.",
              },
            }}
          >
            <div
              className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-3"
              aria-label="Pipeline de interesados"
            >
              {pipelineStages.map((stage) => (
                <Lane
                  key={stage.id}
                  stage={stage}
                  count={
                    contacts.filter(
                      (c) => (c.pipelineStage || "nuevo") === stage.id,
                    ).length
                  }
                >
                  {contacts
                    .filter((c) => (c.pipelineStage || "nuevo") === stage.id)
                    .map((c) => (
                      <LeadCard
                        key={c.id}
                        contact={c}
                        summary={summary(c.id)}
                        onOpen={onOpen}
                        onMove={onMove}
                        busy={Boolean(moving)}
                      />
                    ))}
                </Lane>
              ))}
            </div>
            <DragOverlay>
              {dragged ? (
                <LeadCard
                  overlay
                  contact={dragged}
                  summary={summary(dragged.id)}
                  onOpen={() => {}}
                  onMove={() => {}}
                  busy={false}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
          <p className="shrink-0 text-xs text-muted-foreground">
            Arrastrá desde el ícono de cada tarjeta o usá su menú para cambiar
            de etapa. Los cambios se guardan automáticamente.
          </p>
        </>
      ) : (
        <div className="overflow-auto rounded-xl border bg-card">
          {!contacts.length ? (
            <EmptyState
              icon={<Users />}
              title="No hay interesados para mostrar"
              text="Creá un interesado o ajustá los filtros."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interesado</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Propuesta</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>
                    <span className="sr-only">Abrir</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <button
                        className="flex items-center gap-3 font-medium hover:text-primary"
                        onClick={() => onOpen(c.id)}
                      >
                        <Avatar>
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            {initials(nameOf(c))}
                          </AvatarFallback>
                        </Avatar>
                        {nameOf(c)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <p>{c.fields.email || "Sin email"}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.fields.telefono || "Sin teléfono"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {summary(c.id)}
                    </TableCell>
                    <TableCell>
                      <NativeSelect
                        value={c.pipelineStage || "nuevo"}
                        aria-label={`Etapa de ${nameOf(c)}`}
                        disabled={Boolean(moving)}
                        onChange={(e) => onMove(c.id, e.target.value)}
                      >
                        {pipelineStages.map((s) => (
                          <NativeSelectOption key={s.id} value={s.id}>
                            {s.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {date(c.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Abrir ficha de ${nameOf(c)}`}
                        onClick={() => onOpen(c.id)}
                      >
                        <ArrowUpRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
