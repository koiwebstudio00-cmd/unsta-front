"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { ThemeSwitch } from "./theme-switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
export function Login() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const token = String(
      new FormData(e.currentTarget).get("token") ?? "",
    ).trim();
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message ?? "No se pudo ingresar");
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo ingresar");
      setBusy(false);
    }
  }
  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/40 px-6 py-20">
      <div className="absolute right-4 top-4">
        <ThemeSwitch />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <a
          href="/ingresar"
          className="flex flex-col items-center justify-center gap-2 text-sm font-semibold"
        >
          <div className="rounded-lg bg-primary px-5 py-2">
            <Image
              src="/images/unsta-logo.png"
              alt="UNSTA"
              width={151}
              height={47}
              unoptimized
            />
          </div>
          Atención y admisiones
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Ingresar a la demo</CardTitle>
            <CardDescription>
              Usá tu invitación para probar el asistente y gestionar interesados
              en tu espacio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submit}>
              <div className="grid gap-2">
                <Label htmlFor="invite-token">Código de invitación</Label>
                <Input
                  id="invite-token"
                  name="token"
                  type="password"
                  placeholder="Pegá tu código de acceso"
                  autoComplete="off"
                  required
                  minLength={64}
                  maxLength={64}
                  disabled={busy}
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : null}
                {busy ? "Ingresando…" : "Ingresar a la demo"}
                <ArrowRight />
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Usá datos ficticios. Esta demo no registra inscripciones ni envía
              consultas a la universidad.
            </p>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Central · Yerba Buena
          <br />
          Si tu invitación venció, solicitá un nuevo acceso al responsable de la
          demo.
        </p>
      </div>
    </main>
  );
}
