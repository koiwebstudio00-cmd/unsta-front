import type { Metadata } from "next";
import { Login } from "@/components/login";
export const metadata: Metadata = {
  title: "Ingresar al panel de admisiones | UNSTA Demo",
  description:
    "Accedé con tu email y contraseña a la demo de atención, conversaciones y seguimiento de interesados de UNSTA.",
};
export default function Page() {
  return <Login />;
}
