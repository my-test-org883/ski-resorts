interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: "36px",
          height: "20px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          background: checked ? "var(--accent-blue)" : "var(--bg-tertiary)",
          transition: "background 0.2s ease",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "18px" : "2px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            transition: "left 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
