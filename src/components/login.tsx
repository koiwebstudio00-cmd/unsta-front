"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
          <span className="text-center">
            Universidad del Norte Santo Tomás de Aquino
          </span>
          <span className="font-normal text-muted-foreground">
            Atención y admisiones
          </span>
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Ingresar al panel</CardTitle>
            <CardDescription>
              Ingresá con tu email y contraseña para gestionar la atención y los
              interesados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submit}>
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="tu@email.com"
                  maxLength={254}
                  required
                  disabled={busy}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    maxLength={128}
                    required
                    disabled={busy}
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    aria-controls="login-password"
                    disabled={busy}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              {error ? (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : null}
                {busy ? "Ingresando…" : "Ingresar al panel"}
                <ArrowRight />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Link
              href="/solicitar-acceso"
              className="text-sm font-medium text-primary dark:text-foreground underline-offset-4 hover:underline"
            >
              ¿No tenés una cuenta? Solicitar acceso
            </Link>
            <p className="text-xs text-muted-foreground">
              Usá datos ficticios. Esta demo no registra inscripciones ni envía
              consultas a la universidad.
            </p>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Central · Yerba Buena
          <br />
          Panel de atención UNSTA
        </p>
      </div>
    </main>
  );
}
