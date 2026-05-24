import { z } from "zod";
import { resolveQuery } from "@/lib/resolve";
import { handleError, jsonError, readJson } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

const BodySchema = z.object({ query: z.string().min(1).max(500) });

export async function POST(req: Request) {
  const limit = await checkRateLimit(req);
  if (!limit.ok) return jsonError(429, limit.reason!);

  try {
    const body = BodySchema.parse(await readJson(req));
    const resolved = await resolveQuery({ value: body.query });
    return Response.json(resolved);
  } catch (e) {
    return handleError(e);
  }
}
