import { NextResponse } from "next/server";
import {
  API_URL,
  APP_ORIGIN,
  cookieOptions,
  errorResponse,
} from "@/lib/server-api";
import { validOrigin, sessionValue } from "@/lib/proxy-policy.mjs";
export async function POST(req: Request) {
  if (!validOrigin(req.headers.get("origin"), APP_ORIGIN))
    return errorResponse("Origen no autorizado", 403);
  try {
    const text = await req.text();
    if (text.length > 256)
      return errorResponse("Código de invitación inválido", 400);
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return errorResponse("Código de invitación inválido", 400);
    }
    if (
      !body ||
      Object.keys(body).some((k) => k !== "token") ||
      !sessionValue(body.token)
    )
      return errorResponse("Código de invitación inválido", 400);
    const upstream = await fetch(API_URL + "/v1/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: APP_ORIGIN },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json();
    if (!upstream.ok)
      return errorResponse(
        upstream.status >= 500
          ? "El servicio no está disponible. Intentá nuevamente."
          : (data.error?.message ?? "No se pudo iniciar sesión"),
        upstream.status,
      );
    const session = sessionValue(
      upstream.headers
        .get("set-cookie")
        ?.match(/(?:^|,\s*)unsta_session=([a-f0-9]{64})(?:;|$)/)?.[1],
    );
    const csrf = sessionValue(data.csrf_token);
    if (!session || !csrf)
      return errorResponse(
        "No se pudo guardar la sesión. Solicitá una nueva invitación.",
        502,
      );
    const result = NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    result.cookies.set("unsta_session", session, cookieOptions);
    result.cookies.set("unsta_csrf", csrf, cookieOptions);
    return result;
  } catch {
    return errorResponse(
      "No pudimos conectar con el servicio. Intentá nuevamente.",
      503,
    );
  }
}
