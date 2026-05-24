import { ResolvedProductSchema } from "@/lib/schemas";
import { categorize } from "@/lib/categorize";
import { handleError, jsonError, readJson } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = await checkRateLimit(req);
  if (!limit.ok) return jsonError(429, limit.reason!);

  try {
    const product = ResolvedProductSchema.parse(await readJson(req));
    const cat = await categorize(product);
    return Response.json(cat);
  } catch (e) {
    return handleError(e);
  }
}
