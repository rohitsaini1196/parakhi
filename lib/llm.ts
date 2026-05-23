import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { db } from "@/lib/db";
import { estimateCostUsd } from "@/lib/llm-cost";

/**
 * One narrow interface for structured LLM calls. Two implementations: OpenAI
 * (production) and Ollama (local dev). The rest of the app never knows which.
 *
 * Why structured-only: every LLM call in this product returns JSON validated
 * against a Zod schema. There is no free-form chat path.
 */
export interface CallJsonOptions<T> {
  purpose: "resolve" | "categorize" | "estimate";
  tier: "fast" | "smart"; // maps to env vars LLM_MODEL_FAST / LLM_MODEL_SMART
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaName: string; // used by OpenAI structured outputs
  productId?: string;
  /** Override model. If unset, uses env-configured model for `tier`. */
  model?: string;
}

export interface LlmClient {
  callJson<T>(opts: CallJsonOptions<T>): Promise<T>;
}

const PROVIDER = (process.env.LLM_PROVIDER ?? "openai") as "openai" | "ollama";

function modelFor(tier: "fast" | "smart"): string {
  if (PROVIDER === "openai") {
    return tier === "fast"
      ? (process.env.LLM_MODEL_FAST ?? "gpt-4o-mini")
      : (process.env.LLM_MODEL_SMART ?? "gpt-4o");
  }
  return tier === "fast"
    ? (process.env.OLLAMA_MODEL_FAST ?? "llama3.1:8b")
    : (process.env.OLLAMA_MODEL_SMART ?? "qwen2.5:14b");
}

// ── OpenAI implementation ────────────────────────────────────────────────────

class OpenAILlmClient implements LlmClient {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    this.client = new OpenAI({ apiKey });
  }

  async callJson<T>(opts: CallJsonOptions<T>): Promise<T> {
    const model = opts.model ?? modelFor(opts.tier);
    const resp = await this.client.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: zodResponseFormat(opts.schema, opts.schemaName),
    });

    const choice = resp.choices[0];
    const parsed = choice?.message.parsed;
    if (!parsed) {
      throw new Error(
        `OpenAI returned no parsed output (refusal: ${choice?.message.refusal ?? "none"})`,
      );
    }

    await logCall({
      endpoint: opts.purpose,
      provider: "openai",
      model,
      inputTokens: resp.usage?.prompt_tokens ?? 0,
      outputTokens: resp.usage?.completion_tokens ?? 0,
      productId: opts.productId,
    });

    return stampModel(parsed as T, model);
  }
}

/**
 * If the parsed object has a string `modelUsed` or `overall.modelUsed` field,
 * overwrite it with the actual model that ran. LLMs tend to invent names here.
 */
function stampModel<T>(parsed: T, model: string): T {
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.modelUsed === "string") obj.modelUsed = model;
    const overall = obj.overall;
    if (overall && typeof overall === "object" && "modelUsed" in overall) {
      (overall as Record<string, unknown>).modelUsed = model;
    }
  }
  return parsed;
}

// ── Ollama implementation ────────────────────────────────────────────────────

class OllamaLlmClient implements LlmClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  }

  async callJson<T>(opts: CallJsonOptions<T>): Promise<T> {
    const model = opts.model ?? modelFor(opts.tier);
    // Ollama supports `format: "json"` to coerce output. We still validate with Zod.
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    }
    const body = (await res.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };
    const raw = body.message?.content ?? "";
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Ollama returned non-JSON: ${raw.slice(0, 200)}`);
    }
    const parsed = opts.schema.parse(json);

    await logCall({
      endpoint: opts.purpose,
      provider: "ollama",
      model,
      inputTokens: body.prompt_eval_count ?? 0,
      outputTokens: body.eval_count ?? 0,
      productId: opts.productId,
    });
    return stampModel(parsed, model);
  }
}

// ── Factory + retry wrapper ──────────────────────────────────────────────────

let cached: LlmClient | null = null;

function rawClient(): LlmClient {
  if (cached) return cached;
  cached = PROVIDER === "ollama" ? new OllamaLlmClient() : new OpenAILlmClient();
  return cached;
}

/**
 * Call JSON with one automatic retry on validation/JSON failure. If the second
 * attempt also fails, the error propagates — caller decides whether to surface
 * "couldn't estimate" to the user. We never silently coerce.
 *
 * Before any call, enforces a hard monthly USD spend cap (LLM_MONTHLY_USD_CAP,
 * default 50). When the current calendar month's logged spend meets or exceeds
 * the cap, all calls throw — a billing circuit-breaker. Ollama calls are exempt
 * (local, free). Set the cap to 0 to disable the check entirely.
 */
export async function callJson<T>(opts: CallJsonOptions<T>): Promise<T> {
  await assertUnderSpendCap();
  const client = rawClient();
  try {
    return await client.callJson(opts);
  } catch (err) {
    console.warn(`[llm] ${opts.purpose} attempt 1 failed, retrying`, err);
    return await client.callJson(opts);
  }
}

const MONTHLY_USD_CAP = Number(process.env.LLM_MONTHLY_USD_CAP ?? 50);

export class LlmSpendCapError extends Error {
  constructor(spent: number, cap: number) {
    super(
      `LLM monthly spend cap reached: $${spent.toFixed(2)} of $${cap.toFixed(2)}. ` +
        `Calls are paused until next month or until LLM_MONTHLY_USD_CAP is raised.`,
    );
    this.name = "LlmSpendCapError";
  }
}

async function assertUnderSpendCap(): Promise<void> {
  if (PROVIDER === "ollama") return; // local, free
  if (!MONTHLY_USD_CAP || MONTHLY_USD_CAP <= 0) return; // disabled
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const agg = await db.llmCall.aggregate({
    _sum: { costUsd: true },
    where: { createdAt: { gte: startOfMonth } },
  });
  const spent = agg._sum.costUsd ?? 0;
  if (spent >= MONTHLY_USD_CAP) {
    throw new LlmSpendCapError(spent, MONTHLY_USD_CAP);
  }
}

// ── Logging ──────────────────────────────────────────────────────────────────

async function logCall(args: {
  endpoint: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  productId?: string;
}) {
  try {
    await db.llmCall.create({
      data: {
        endpoint: args.endpoint,
        provider: args.provider,
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        costUsd: estimateCostUsd(args.model, args.inputTokens, args.outputTokens),
        productId: args.productId,
      },
    });
  } catch (e) {
    // Logging must never break a user request.
    console.warn("[llm] failed to log call", e);
  }
}
