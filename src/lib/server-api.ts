import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionValue } from "./proxy-policy.mjs";
export const API_URL = (process.env.API_URL ?? "http://127.0.0.1:4100").replace(
  /\/$/,
  "",
);
export const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 86400,
};
export function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export function clearSession(res: NextResponse) {
  res.cookies.set("unsta_session", "", { ...cookieOptions, maxAge: 0 });
  res.cookies.set("unsta_csrf", "", { ...cookieOptions, maxAge: 0 });
  return res;
}
export async function backend(path: string, method = "GET", body?: unknown) {
  const store = await cookies();
  const session = sessionValue(store.get("unsta_session")?.value),
    csrf = sessionValue(store.get("unsta_csrf")?.value);
  if (!session || (method !== "GET" && !csrf)) return null;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Cookie: `unsta_session=${session}`,
  };
  if (method !== "GET") {
    headers.Origin = APP_ORIGIN;
    headers["X-CSRF-Token"] = csrf!;
    headers["Content-Type"] = "application/json";
  }
  return fetch(API_URL + "/v1/demo/" + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
}
