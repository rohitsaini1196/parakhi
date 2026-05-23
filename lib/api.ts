/**
 * Small helpers to keep route handlers boring and uniform.
 */

export function jsonError(status: number, message: string, extra?: object) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function handleError(e: unknown): Response {
  if (e instanceof HttpError) return jsonError(e.status, e.message);
  const message = e instanceof Error ? e.message : "Unknown error";
  console.error("[api] unhandled error:", e);
  return jsonError(500, message);
}
