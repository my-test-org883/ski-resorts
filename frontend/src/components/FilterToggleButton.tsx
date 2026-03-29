interface FilterToggleButtonProps {
  activeFilterCount: number;
  onClick: () => void;
}

export function FilterToggleButton({ activeFilterCount, onClick }: FilterToggleButtonProps) {
  return (
    <button
      aria-label="Filters"
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--bg-tertiary)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-primary)",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="7" y1="12" x2="17" y2="12" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </svg>
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span
          data-testid="filter-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            background: "var(--accent-blue)",
            borderRadius: "9px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
