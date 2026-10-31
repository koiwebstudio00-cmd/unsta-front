export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/demo/" + path, {
      method: options?.method ?? "GET",
      headers:
        options?.body === undefined
          ? {}
          : { "Content-Type": "application/json" },
      body:
        options?.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "No pudimos conectar. Revisá tu conexión e intentá nuevamente.",
      0,
    );
  }
  if (response.status === 401) {
    window.location.assign("/ingresar");
    throw new ApiError("Tu sesión venció", 401);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      data.error?.message ?? "No se pudo completar la operación",
      response.status,
    );
  return data as T;
}
export const swrOptions = {
  revalidateOnFocus: true,
  shouldRetryOnError: false,
  refreshWhenHidden: false,
  dedupingInterval: 1000,
};
