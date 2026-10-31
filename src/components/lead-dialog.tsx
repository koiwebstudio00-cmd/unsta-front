"use client";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Contact, Conversation, Mutation } from "@/lib/types";

export function LeadDialog({
  open,
  onOpenChange,
  act,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  act: Mutation;
  onCreated: (result: { contact: Contact; conversation: Conversation }) => void;
}) {
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const fields = Object.fromEntries(
      [...new FormData(e.currentTarget)]
        .filter(([, value]) => String(value).trim())
        .map(([key, value]) => [key, String(value).trim()]),
    );
    setSaving(true);
    try {
      const result = (await act(
        "contacts",
        fields,
        "POST",
        "Interesado creado",
      )) as { contact: Contact; conversation: Conversation };
      onCreated(result);
      onOpenChange(false);
    } catch {
      /* The shared mutation shows the error; preserve the form. */
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo interesado</DialogTitle>
          <DialogDescription>
            Se agregará a Nuevos con una conversación lista para probar. Usá
            datos ficticios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Nombre y apellido</Label>
            <Input
              id="lead-name"
              name="nombre"
              required
              maxLength={200}
              autoFocus
              placeholder="Ej. Sofía Martínez"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">
              Email{" "}
              <span className="text-muted-foreground font-normal">
                · opcional
              </span>
            </Label>
            <Input
              id="lead-email"
              name="email"
              type="email"
              maxLength={254}
              placeholder="sofia@example.test"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-phone">
              Teléfono{" "}
              <span className="text-muted-foreground font-normal">
                · opcional
              </span>
            </Label>
            <Input
              id="lead-phone"
              name="telefono"
              minLength={6}
              maxLength={40}
              placeholder="381 000 0000"
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" /> : <Plus />}
              {saving ? "Guardando…" : "Crear interesado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
