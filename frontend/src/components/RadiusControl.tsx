interface RadiusControlProps {
  radiusKm: number;
  onChange: (radius: number) => void;
}

export function RadiusControl({ radiusKm, onChange }: RadiusControlProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <label style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
        Radius
      </label>
      <input
        type="range"
        min={50}
        max={500}
        step={50}
        value={radiusKm}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100px", accentColor: "var(--accent-blue)" }}
      />
      <span
        style={{
          fontSize: "12px",
          color: "var(--text-primary)",
          fontWeight: 600,
          minWidth: "45px",
        }}
      >
        {radiusKm} km
      </span>
    </div>
  );
}
