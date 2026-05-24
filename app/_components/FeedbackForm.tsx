"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "correction" | "suggestion" | "vote";

export function FeedbackForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>(productId ? "correction" : "suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message,
          productId,
          submitterEmail: email || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.push("/feedback?ok=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          className="w-full rounded-lg border border-line bg-bg-raised px-3 py-2 text-sm"
        >
          <option value="correction">Correction — a number looks wrong</option>
          <option value="suggestion">Suggestion — add a product or category</option>
          <option value="vote">Vote — me too</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="What did we get wrong? Link a source if you have one."
          className="w-full rounded-lg border border-line bg-bg-raised px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Email (optional, only if you want a reply)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-bg-raised px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-abroad">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
