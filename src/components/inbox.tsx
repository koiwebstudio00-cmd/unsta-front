"use client";
import { useState } from "react";
import { Search, Plus, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { EmptyState } from "./feedback";
import { nameOf, initials, modes, date } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { Directory } from "@/lib/types";

export function Inbox({
  data,
  selected,
  onSelect,
  onNew,
}: {
  data: Directory;
  selected: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const list = data.conversations
    .filter((c) => {
      const contact = data.contacts.find((p) => p.id === c.contactId);
      return (
        (filter === "all" ||
          (filter === "open" ? c.mode !== "cerrada" : c.mode === "cerrada")) &&
        [nameOf(contact), contact?.fields.email, contact?.fields.telefono]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <aside
      aria-label="Lista de conversaciones"
      className="flex h-full min-h-0 flex-col bg-muted/20"
    >
      <div className="space-y-4 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversaciones</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Nueva conversación"
            onClick={onNew}
          >
            <Plus />
          </Button>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full" aria-label="Filtrar conversaciones">
            <TabsTrigger value="open">Abiertas</TabsTrigger>
            <TabsTrigger value="closed">Cerradas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="bg-background pl-9"
            placeholder="Buscar contacto"
            aria-label="Buscar conversación"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!list.length ? (
          <EmptyState
            icon={<MessageSquare />}
            title="Sin conversaciones"
            text="Probá otro filtro o creá un interesado."
          />
        ) : (
          list.map((c) => {
            const contact = data.contacts.find((p) => p.id === c.contactId);
            return (
              <button
                key={c.id}
                aria-label={`Conversación con ${nameOf(contact)}`}
                aria-current={selected === c.id ? "true" : undefined}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "mb-1 flex w-full gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-muted",
                  selected === c.id &&
                    "border-primary/10 bg-accent hover:bg-accent",
                )}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-background text-xs text-primary dark:text-foreground">
                    {initials(nameOf(contact))}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold">
                      {nameOf(contact)}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {date(c.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {contact?.fields.telefono ||
                      contact?.fields.email ||
                      "Contacto pendiente"}
                  </p>
                  <span className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        c.mode === "esperando_humano"
                          ? "bg-amber-500"
                          : c.mode === "humano"
                            ? "bg-primary"
                            : "bg-muted-foreground/40",
                      )}
                    />
                    {modes[c.mode]}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="border-t px-4 py-3 text-[11px] text-muted-foreground">
        {list.length} conversaciones · Espacio de prueba
      </div>
    </aside>
  );
}
