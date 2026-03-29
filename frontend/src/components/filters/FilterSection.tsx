import { useState, type ReactNode } from "react";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid var(--bg-tertiary)" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          padding: "12px 0",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.2px",
        }}
      >
        {title}
        <span
          data-testid="filter-section-chevron"
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: "10px",
          }}
        >
          ▼
        </span>
      </button>
      <div
        data-collapsed={String(!open)}
        style={{
          overflow: "hidden",
          maxHeight: open ? "500px" : "0",
          transition: "max-height 0.2s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
