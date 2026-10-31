import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
export const metadata: Metadata = {
  title: "Solicitar acceso al panel | UNSTA",
  description:
    "Contactá a Koi para solicitar una cuenta del panel de atención y admisiones de UNSTA.",
};
const email = "koi.webstudio00@gmail.com";
const mailto = `mailto:${email}?subject=${encodeURIComponent("Solicitud de acceso al panel UNSTA")}&body=${encodeURIComponent("Hola, quisiera solicitar acceso al panel UNSTA.\n\nNombre y apellido: \nÁrea o equipo: \nEmail para la cuenta: \n")}`;
export default function AccessPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/40 px-6 py-20">
      <div className="absolute right-4 top-4">
        <ThemeSwitch />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center text-sm">
          <div className="rounded-lg bg-primary px-5 py-2">
            <Image
              src="/images/unsta-logo.png"
              alt="UNSTA"
              width={151}
              height={47}
              unoptimized
            />
          </div>
          <p className="font-semibold">
            Universidad del Norte Santo Tomás de Aquino
          </p>
          <p className="text-muted-foreground">Atención y admisiones</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Solicitar acceso</CardTitle>
            <CardDescription>
              Contactá al equipo de Koi para solicitar una cuenta o recibir
              ayuda para ingresar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="font-medium">Koi Web Studio</p>
              <a
                href={`mailto:${email}`}
                className="break-all text-primary dark:text-foreground underline-offset-4 hover:underline"
              >
                {email}
              </a>
            </div>
            <p className="text-muted-foreground">
              Incluí tu nombre, área o equipo y el email que querés usar. No
              envíes contraseñas.
            </p>
            <Button asChild className="w-full">
              <a href={mailto}>
                <Mail />
                Solicitar acceso por email
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Se abrirá tu aplicación de correo. El equipo revisará tu solicitud
              y te indicará cómo ingresar.
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/ingresar"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver al ingreso
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
