"use client";
import { useState, useRef, useEffect } from "react";
import { pageMetadata } from "@/lib/page-metadata";
import { demandQuery, demandPeriods, type DemandSelection } from "@/lib/demand";
import useSWR from "swr";
import {
  MessageSquare,
  Users,
  CalendarDays,
  Activity,
  Plus,
  House,
  ArrowLeft,
  PanelRight,
  LoaderCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { api, swrOptions } from "@/lib/client-api";
import type {
  Directory,
  Contact,
  ConversationDetail,
  Profile as ProfileData,
  Followup,
  Status,
  Proposal,
  KnowledgeRecord,
  Mutation,
  Conversation,
} from "@/lib/types";
import { stageLabel } from "@/lib/pipeline";
import { Chat } from "./chat";
import { Profile } from "./profile";
import { FollowupView, StatusView } from "./management";
import { Pipeline } from "./pipeline";
import { Overview } from "./overview";
import { Inbox } from "./inbox";
import { LeadDialog } from "./lead-dialog";
import { Loading } from "./feedback";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Toaster } from "./ui/sonner";
import { ThemeSwitch } from "./theme-switch";
import { ProjectDescription } from "./project-description";
import { cn } from "@/lib/utils";
const views = {
  project: {
    label: "Descripción del proyecto",
    icon: FileText,
    description:
      "Qué se desarrolló, cómo funciona y qué información tiene disponible.",
  },
  home: {
    label: "Inicio",
    icon: House,
    description: "Una mirada a la atención y las admisiones de tu universidad.",
  },
  contacts: {
    label: "Interesados",
    icon: Users,
    description: "Acompañá cada consulta hasta su próximo paso.",
  },
  chat: { label: "Conversaciones", icon: MessageSquare, description: "" },
  followup: {
    label: "Seguimiento",
    icon: CalendarDays,
    description: "Organizá las tareas y los próximos contactos.",
  },
  status: {
    label: "Estado de la demo",
    icon: Activity,
    description: "Conexiones y base de conocimiento.",
  },
};
export type View = keyof typeof views;
const emptyDirectory: Directory = {
  contacts: [],
  interests: [],
  conversations: [],
};
export function Dashboard({
  initialView,
  initialConversation,
  initialDemand = null,
}: {
  initialView: View;
  initialConversation?: string;
  initialDemand?: DemandSelection | null;
}) {
  const [view, setView] = useState<View>(initialView);
  // Internal navigation uses history.replaceState, so it does not request
  // new server metadata. Synchronize the same metadata without duplicate tags.
  useEffect(() => {
    const metadata = pageMetadata[view];
    document.title = metadata.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata.description);
  }, [view]);
  const [demandFilter, setDemandFilter] = useState<DemandSelection | null>(
    initialDemand,
  );
  const [selected, setSelected] = useState(initialConversation ?? "");
  const [role, setRole] = useState<"visitor" | "operator">("operator");
  const [busy, setBusy] = useState(false);
  const [newLead, setNewLead] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileThread, setMobileThread] = useState(
    Boolean(initialConversation),
  );
  const [moving, setMoving] = useState<string | null>(null);
  const lock = useRef(false),
    moveLock = useRef(false);
  const me = useSWR<{ email: string }>("me", api, swrOptions);
  const status = useSWR<Status>("status", api, {
    ...swrOptions,
    refreshInterval: 15000,
  });
  const catalog = useSWR<{ proposals: Proposal[] }>("catalog", api, swrOptions);
  const knowledge = useSWR<{ records: KnowledgeRecord[] }>(
    "knowledge",
    api,
    swrOptions,
  );
  const directory = useSWR<Directory>("contacts", api, {
    ...swrOptions,
    refreshInterval: 10000,
  });
  const followup = useSWR<Followup>("followup", api, {
    ...swrOptions,
    refreshInterval: 10000,
  });
  const conversation = useSWR<ConversationDetail>(
    selected ? `conversations/${selected}` : null,
    api,
    { ...swrOptions, refreshInterval: selected ? 2500 : 0 },
  );
  const profile = useSWR<ProfileData>(
    conversation.data ? `contacts/${conversation.data.contact.id}` : null,
    api,
    { ...swrOptions, refreshInterval: view === "chat" ? 5000 : 0 },
  );
  const demandDetails = useSWR<Directory>(
    view === "contacts" && demandFilter
      ? `demand/contacts?${demandQuery(demandFilter)}&proposal_id=${encodeURIComponent(demandFilter.proposalId)}&pending=${demandFilter.pending}`
      : null,
    api,
    { ...swrOptions, refreshInterval: 10000 },
  );
  const activeDirectory =
    view === "contacts" && demandFilter ? demandDetails : directory;
  const resources = [
    me,
    status,
    catalog,
    knowledge,
    directory,
    followup,
    conversation,
    profile,
    demandDetails,
  ];
  function navigate(
    next: View,
    id = selected,
    demand: DemandSelection | null = null,
  ) {
    setDemandFilter(next === "contacts" ? demand : null);
    setView(next);
    setSelected(id);
    const params = new URLSearchParams({ view: next });
    if (id) params.set("conversation", id);
    if (next === "contacts" && demand) {
      params.set("propuesta", demand.proposalId);
      params.set("dias", demand.days);
      params.set("sede", demand.sede);
      params.set("tipo", demand.kind);
      params.set("pendientes", String(demand.pending));
    }
    window.history.replaceState(null, "", `/?${params}`);
  }
  const act: Mutation = async (path, body, method = "POST", success) => {
    if (lock.current) throw new Error("Hay una acción en curso");
    lock.current = true;
    setBusy(true);
    try {
      const result = await api(path, { method, body });
      await Promise.allSettled([
        directory.mutate(),
        followup.mutate(),
        conversation.mutate(),
        profile.mutate(),
        demandDetails.mutate(),
      ]);
      if (success) toast.success(success);
      return result;
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "No se pudo guardar. Intentá nuevamente.",
      );
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  async function moveLead(id: string, stage: string, undo = true) {
    if (moveLock.current) return;
    const previous =
      activeDirectory.data?.contacts.find((c) => c.id === id)?.pipelineStage ??
      "nuevo";
    moveLock.current = true;
    setMoving(id);
    const replace = (
      current: Directory | undefined,
      contact: Partial<Contact>,
    ) => ({
      ...(current ?? emptyDirectory),
      contacts: (current?.contacts ?? []).map((c) =>
        c.id === id ? { ...c, ...contact } : c,
      ),
    });
    try {
      await activeDirectory.mutate(
        async (current) => {
          const saved = await api<Contact>(`contacts/${id}/stage`, {
            method: "PATCH",
            body: { stage },
          });
          return replace(current, saved);
        },
        {
          optimisticData: (current) =>
            replace(current, { pipelineStage: stage }),
          rollbackOnError: true,
          revalidate: Boolean(demandFilter),
        },
      );
      void profile.mutate();
      if (demandFilter) void directory.mutate();
      toast.success(
        `Movido a ${stageLabel(stage)}`,
        undo
          ? {
              duration: 10000,
              action: {
                label: "Deshacer",
                onClick: () => {
                  void moveLead(id, previous, false);
                },
              },
            }
          : undefined,
      );
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "No se pudo mover el interesado. Se restauró su etapa.",
      );
    } finally {
      moveLock.current = false;
      setMoving(null);
    }
  }
  function selectConversation(id: string) {
    setRole("operator");
    setMobileThread(true);
    navigate("chat", id);
  }
  async function openContact(id: string) {
    const cv = activeDirectory.data?.conversations
      .filter((c) => c.contactId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (cv) selectConversation(cv.id);
    else
      try {
        const result = (await act("conversations", { contact_id: id })) as {
          conversation: Conversation;
        };
        selectConversation(result.conversation.id);
      } catch {}
  }
  const d = directory.data ?? emptyDirectory;
  const proposals = catalog.data?.proposals ?? [];
  const loadError = [
    me,
    activeDirectory,
    catalog,
    ...(view === "chat"
      ? [conversation, profile]
      : view === "followup" || view === "home"
        ? [followup]
        : [status, knowledge]),
  ].find((r) => r.error)?.error;
  const profilePanel = (
    <Profile
      key={conversation.data?.contact.id ?? "empty"}
      data={profile.data}
      conversation={conversation.data}
      catalog={proposals}
      operator={true}
      busy={busy}
      act={act}
      loading={profile.isLoading}
    />
  );
  return (
    <SidebarProvider
      defaultOpen={initialView !== "chat"}
      className="h-svh min-h-0 overflow-hidden"
      style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
    >
      <AppSidebar
        variant="inset"
        items={Object.entries(views)
          .filter(([id]) => id !== "status" && id !== "project")
          .map(([id, v]) => ({
            title: v.label,
            icon: <v.icon />,
            isActive: view === id,
            count: id === "contacts" ? d.contacts.length : undefined,
            onSelect: () => navigate(id as View),
          }))}
        email={me.data?.email ?? "Cargando acceso…"}
        busy={busy}
        onLogout={() =>
          void act("logout", {})
            .then(() => window.location.assign("/ingresar"))
            .catch(() => {})
        }
        onStatus={() => navigate("status")}
      />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:gap-3 md:px-6">
          <SidebarTrigger aria-label="Alternar barra lateral" />
          <span className="h-4 w-px bg-border" />
          <span className="min-w-0 truncate text-sm font-medium">
            {views[view].label}
          </span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
            Central · Yerba Buena
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Demo
          </Badge>
          <Button
            variant={view === "project" ? "secondary" : "ghost"}
            size="sm"
            className="shrink-0"
            aria-label="Descripción del proyecto"
            aria-current={view === "project" ? "page" : undefined}
            onClick={() => navigate("project")}
          >
            <FileText aria-hidden="true" />
            <span className="hidden sm:inline">Proyecto</span>
          </Button>
          <div className="ml-auto sm:ml-0">
            <ThemeSwitch />
          </div>
          {busy || moving ? (
            <LoaderCircle
              className="size-4 animate-spin text-primary"
              aria-label="Guardando cambios"
            />
          ) : null}
        </header>
        {loadError && (
          <Alert variant="destructive" className="m-3 w-auto shrink-0">
            <AlertDescription className="flex items-center justify-between gap-2">
              {loadError.message}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void Promise.allSettled(resources.map((r) => r.mutate()))
                }
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {view === "chat" ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_260px] 2xl:grid-cols-[280px_minmax(0,1fr)_300px]">
            <div
              className={cn(
                "min-h-0 border-r",
                mobileThread && "hidden md:block",
              )}
            >
              <Inbox
                data={d}
                selected={selected}
                onSelect={selectConversation}
                onNew={() => setNewLead(true)}
              />
            </div>
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-col",
                !mobileThread && "hidden md:flex",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Volver a conversaciones"
                  onClick={() => setMobileThread(false)}
                >
                  <ArrowLeft />
                </Button>
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status.data?.dispatch_enabled
                        ? "bg-emerald-500"
                        : "bg-amber-400",
                    )}
                  />
                  {status.data?.dispatch_enabled
                    ? "Asistente habilitado"
                    : "Asistente pendiente de conexión"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto lg:hidden"
                  onClick={() => setShowProfile(true)}
                  disabled={!conversation.data}
                >
                  <PanelRight />
                  Ficha
                </Button>
              </div>
              <Chat
                key={selected}
                detail={conversation.data}
                loading={conversation.isLoading}
                role={role}
                setRole={setRole}
                status={status.data}
                busy={busy}
                act={act}
                onNew={() => setNewLead(true)}
                knowledge={knowledge.data?.records ?? []}
              />
            </div>
            <aside
              className="hidden min-h-0 overflow-y-auto border-l lg:block"
              aria-label="Información del interesado"
            >
              {!showProfile ? profilePanel : null}
            </aside>
            <Sheet open={showProfile} onOpenChange={setShowProfile}>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Información del interesado</SheetTitle>
                  <SheetDescription>
                    Datos, propuestas y seguimiento.
                  </SheetDescription>
                </SheetHeader>
                {showProfile ? profilePanel : null}
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div
            key={view}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 md:p-7",
              view === "contacts" && "overflow-hidden",
            )}
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Admisiones UNSTA
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {view === "home"
                    ? "Todo listo para acompañar."
                    : views[view].label}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {views[view].description}
                </p>
              </div>
              {view !== "status" && view !== "project" && (
                <Button onClick={() => setNewLead(true)}>
                  <Plus />
                  Nuevo interesado
                </Button>
              )}
            </div>
            {view === "project" ? (
              <ProjectDescription />
            ) : view === "home" ? (
              directory.isLoading || followup.isLoading ? (
                <Loading />
              ) : (
                <Overview
                  directory={d}
                  onDemand={(selection) =>
                    navigate("contacts", selected, selection)
                  }
                  followup={followup.data}
                  status={status.data}
                  onOpen={(id) => void openContact(id)}
                  navigate={navigate}
                  onNew={() => setNewLead(true)}
                  act={act}
                  busy={busy}
                />
              )
            ) : view === "contacts" ? (
              activeDirectory.isLoading ? (
                <Loading />
              ) : (
                <>
                  {demandFilter && (
                    <div
                      className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border bg-accent/40 p-3 text-sm"
                      role="region"
                      aria-label="Filtro de demanda activo"
                    >
                      <div>
                        <strong>
                          {proposals.find(
                            (p) => p.id === demandFilter.proposalId,
                          )?.titulo ?? "Propuesta"}
                        </strong>
                        <p className="text-xs text-muted-foreground">
                          {demandPeriods[demandFilter.days]} ·{" "}
                          {demandFilter.sede === "all"
                            ? "Todas las sedes"
                            : demandFilter.sede === "central"
                              ? "Central"
                              : "Yerba Buena"}
                          {demandFilter.pending
                            ? " · Nuevos o En seguimiento"
                            : " · Todos los interesados"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("contacts")}
                      >
                        Quitar filtro de demanda
                      </Button>
                    </div>
                  )}
                  <Pipeline
                    key={
                      demandFilter ? JSON.stringify(demandFilter) : "directory"
                    }
                    data={activeDirectory.data ?? emptyDirectory}
                    catalog={proposals}
                    moving={moving}
                    onMove={(id, stage) => void moveLead(id, stage)}
                    onOpen={(id) => void openContact(id)}
                  />
                </>
              )
            ) : view === "followup" ? (
              followup.data ? (
                <FollowupView
                  data={followup.data}
                  directory={d}
                  catalog={proposals}
                  busy={busy}
                  act={act}
                  onConversation={selectConversation}
                />
              ) : (
                <Loading />
              )
            ) : status.data ? (
              <StatusView
                status={status.data}
                catalog={proposals}
                knowledge={knowledge.data?.records ?? []}
              />
            ) : (
              <Loading />
            )}
          </div>
        )}
      </SidebarInset>
      <LeadDialog
        open={newLead}
        onOpenChange={setNewLead}
        act={act}
        onCreated={(result) => {
          if (view === "chat") {
            setRole("visitor");
            setMobileThread(true);
            navigate("chat", result.conversation.id);
          }
        }}
      />
      <Toaster position="bottom-right" richColors closeButton />
    </SidebarProvider>
  );
}
