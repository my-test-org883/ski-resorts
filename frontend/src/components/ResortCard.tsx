import type { Resort } from "../types/resort";
import { SCORE_COLORS, SCORE_LABELS } from "../types/resort";

interface ResortCardProps {
  resort: Resort;
  selected: boolean;
  onClick: () => void;
}

export function ResortCard({ resort, selected, onClick }: ResortCardProps) {
  const color = SCORE_COLORS[resort.condition.score];
  const label = SCORE_LABELS[resort.condition.score];

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: selected ? "var(--bg-tertiary)" : "var(--bg-secondary)",
        borderTop: `3px solid ${color}`,
        border: selected ? `1px solid ${color}` : "1px solid transparent",
        borderTopWidth: "3px",
        borderTopColor: color,
        borderRadius: "var(--radius-sm)",
        padding: "12px 16px",
        minWidth: "180px",
        maxWidth: "220px",
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        transition: "background 0.15s, border-color 0.15s",
        color: "inherit",
        font: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
          {resort.name}
        </span>
      </div>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <div
        style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}
      >
        <span>❄ {Math.round(resort.condition.freshSnowCm)}cm</span>
        <span>🌡 {Math.round(resort.condition.temperature)}°</span>
      </div>
      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
        {Math.round(resort.distanceKm)} km away
      </span>
    </button>
  );
}
