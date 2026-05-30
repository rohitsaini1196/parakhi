import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";

  const product = slug
    ? await db.product.findUnique({
        where: { slug },
        include: { breakdown: true, category: true },
      })
    : null;

  // Default fallback — no product found
  if (!product?.breakdown) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f0e0b",
            color: "#e8e0d0",
            fontFamily: "serif",
          }}
        >
          <div style={{ fontSize: 32, fontStyle: "italic" }}>parakhi</div>
          <div style={{ fontSize: 16, color: "#6b6355", marginTop: 12 }}>
            kya hai andar?
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const im = z.array(ImportSchema).parse(JSON.parse(product.breakdown.importsJson));
  const g = GstInfoSchema.parse(JSON.parse(product.breakdown.gstJson));
  const tax = Math.round(g.ratePct);
  const abroad = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
  const india = Math.max(0, 100 - tax - abroad);
  const ivc = Math.round(product.breakdown.madeInIndiaScoreBp / 100);
  const mrp = product.mrpInPaise ? Math.round(product.mrpInPaise / 100) : null;

  const ivcColor = ivc >= 85 ? "#4caf7d" : ivc >= 65 ? "#c8972a" : "#c0392b";

  // Bar widths as percentages of 860px (total bar width)
  const BAR_W = 860;
  const indiaW = Math.round((india / 100) * BAR_W);
  const taxW = Math.round((tax / 100) * BAR_W);
  const abroadW = BAR_W - indiaW - taxW;

  const title = product.brand === product.name
    ? product.name
    : `${product.brand} ${product.name}`;
  const subtitle = [product.variant, product.category.displayName]
    .filter(Boolean)
    .join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f0e0b",
          color: "#e8e0d0",
          padding: "64px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand + logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6355", fontFamily: "monospace" }}>
              {product.category.displayName}
            </div>
            <div style={{ fontSize: "clamp(32px,4vw,48px)", fontStyle: "italic", lineHeight: 1.1, maxWidth: 640 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 16, color: "#8a7f6e", marginTop: 4 }}>
                {subtitle}{mrp ? ` · ₹${mrp}` : ""}
              </div>
            )}
          </div>

          {/* IVC number */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 96, fontStyle: "italic", color: ivcColor, lineHeight: 1, letterSpacing: "-0.04em" }}>
              {ivc}%
            </div>
            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6355", fontFamily: "monospace", marginTop: 4 }}>
              Indian Value Capture
            </div>
          </div>
        </div>

        {/* MoneyBar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", width: `${BAR_W}px`, height: "18px", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${indiaW}px`, height: "18px", background: "#4caf7d" }} />
            <div style={{ width: `${taxW}px`, height: "18px", background: "#c8972a" }} />
            <div style={{ width: `${abroadW}px`, height: "18px", background: "#c0392b" }} />
          </div>
          <div style={{ display: "flex", gap: 40, fontFamily: "monospace" }}>
            {[
              { label: "INDIA", val: india, color: "#4caf7d" },
              { label: "TAX", val: tax, color: "#c8972a" },
              { label: "ABROAD", val: abroad, color: "#c0392b" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color, letterSpacing: "0.15em" }}>●</span>
                <span style={{ fontSize: 12, color: "#6b6355", letterSpacing: "0.12em" }}>{label}</span>
                <span style={{ fontSize: 18, fontStyle: "italic", color: "#e8e0d0", fontFamily: "serif" }}>{val}%</span>
                {mrp && (
                  <span style={{ fontSize: 12, color: "#6b6355", fontFamily: "monospace" }}>
                    ₹{((mrp * val) / 100).toFixed(0)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, fontStyle: "italic", color: "#e8e0d0" }}>parakhi</div>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a4035", fontFamily: "monospace" }}>
            parakhi.in
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
