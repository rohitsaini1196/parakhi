"use server";

import { revalidatePath } from "next/cache";
import {
  approveDraft,
  draftCategoryTemplate,
  rejectDraft,
} from "@/lib/draft-category";

/**
 * Server actions backing the admin draft-review queue. Protected by the
 * existing /admin basic-auth middleware (matcher: "/admin/:path*").
 *
 * No public callers — these only fire from forms rendered on /admin.
 */

// Errors are caught + logged; the page revalidates regardless so the user
// sees the new state. Surface errors in a future toast layer.

export async function generateDraftAction(formData: FormData): Promise<void> {
  const exampleQuery = String(formData.get("exampleQuery") ?? "").trim();
  const categoryHint =
    String(formData.get("categoryHint") ?? "").trim() || undefined;
  if (!exampleQuery) return;
  try {
    await draftCategoryTemplate({ exampleQuery, categoryHint });
  } catch (e) {
    console.error("[admin] generateDraft failed", e);
  }
  revalidatePath("/admin");
}

export async function approveDraftAction(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const reviewerNotes =
    String(formData.get("reviewerNotes") ?? "").trim() || undefined;
  if (!draftId) return;
  try {
    await approveDraft(draftId, reviewerNotes);
  } catch (e) {
    console.error("[admin] approveDraft failed", e);
  }
  revalidatePath("/admin");
}

export async function rejectDraftAction(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const reviewerNotes =
    String(formData.get("reviewerNotes") ?? "").trim() || undefined;
  if (!draftId) return;
  try {
    await rejectDraft(draftId, reviewerNotes);
  } catch (e) {
    console.error("[admin] rejectDraft failed", e);
  }
  revalidatePath("/admin");
}
