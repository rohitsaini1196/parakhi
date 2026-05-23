import { z } from "zod";
import { db } from "@/lib/db";
import { handleError, jsonError, readJson } from "@/lib/api";

const BodySchema = z.object({
  productId: z.string().nullish(),
  kind: z.enum(["correction", "suggestion", "vote"]),
  message: z.string().min(1).max(5000),
  submitterEmail: z.string().email().nullish(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await readJson(req));
    const fb = await db.feedback.create({
      data: {
        productId: body.productId ?? null,
        kind: body.kind,
        message: body.message,
        submitterEmail: body.submitterEmail ?? null,
      },
    });
    return Response.json({ id: fb.id });
  } catch (e) {
    return handleError(e);
  }
}
