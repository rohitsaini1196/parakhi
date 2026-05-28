export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.97 0.01 100)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "oklch(0.55 0.03 100)",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      >
        analysing
      </div>
      <div
        style={{
          width: 280,
          height: 6,
          borderRadius: 3,
          background: "oklch(0.90 0.02 100)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "oklch(0.55 0.15 145)",
            borderRadius: 3,
            animation: "shimmer 1.4s ease-in-out infinite",
            transformOrigin: "left",
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
