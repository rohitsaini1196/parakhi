import { db } from "@/lib/db";
import { hashIp, ipFrom } from "@/lib/rate-limit";
import { handleError, jsonError } from "@/lib/api";

async function castVote(req: Request, target: string) {
  const t = target.trim();
  if (!t) return jsonError(400, "Missing target");
  const ipHash = hashIp(ipFrom(req));
  try {
    await db.vote.create({ data: { target: t, ipHash } });
  } catch {
    // duplicate (target, ipHash) — silent success; one vote per IP per target.
  }
  const count = await db.vote.count({ where: { target: t } });
  return { target: t, count };
}

// Form-encoded submissions from the uncategorized page.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const target = String(form.get("target") ?? "");
    const result = await castVote(req, target);
    // Redirect back to referrer if posted from a form.
    const referer = req.headers.get("referer");
    if (referer) return Response.redirect(referer, 303);
    return Response.json(result);
  } catch (e) {
    return handleError(e);
  }
}
