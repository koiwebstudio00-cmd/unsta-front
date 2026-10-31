import { NextResponse } from "next/server";
import {
  backend,
  APP_ORIGIN,
  errorResponse,
  clearSession,
} from "@/lib/server-api";
import { allowedRoute, validOrigin, backendPath } from "@/lib/proxy-policy.mjs";
type Context = { params: Promise<{ path: string[] }> };
async function proxy(req: Request, context: Context) {
  const { path } = await context.params;
  if (!allowedRoute(req.method, path))
    return errorResponse("Recurso no encontrado", 404);
  if (
    req.method !== "GET" &&
    !validOrigin(req.headers.get("origin"), APP_ORIGIN)
  )
    return errorResponse("Origen no autorizado", 403);
  try {
    let body: unknown;
    if (req.method !== "GET") {
      const raw = await req.text();
      if (new TextEncoder().encode(raw).length > 32768)
        return errorResponse("El contenido es demasiado extenso", 413);
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        return errorResponse("Contenido inválido", 400);
      }
    }
    const result = await backend(
      backendPath(req.method, path, req.url),
      req.method,
      body,
    );
    if (!result)
      return clearSession(
        errorResponse("Tu sesión venció. Volvé a ingresar.", 401),
      );
    if (result.status === 401)
      return clearSession(
        errorResponse("Tu sesión venció. Volvé a ingresar.", 401),
      );
    if (result.status === 204)
      return clearSession(new NextResponse(null, { status: 204 }));
    if (result.status >= 500)
      return errorResponse(
        "El servicio no pudo completar la operación. Intentá nuevamente.",
        result.status,
      );
    const response = NextResponse.json(await result.json(), {
      status: result.status,
      headers: { "Cache-Control": "no-store" },
    });
    return path[0] === "logout" ? clearSession(response) : response;
  } catch {
    return errorResponse(
      "No pudimos conectar con el servicio. Tus cambios pendientes siguen en pantalla.",
      503,
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
