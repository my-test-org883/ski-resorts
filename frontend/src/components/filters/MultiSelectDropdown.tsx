import { useState, useRef, useEffect } from "react";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Any",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const handleToggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const displayText = selected.length > 0 ? `${selected.length} selected` : placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "6px 10px",
          background: "var(--bg-tertiary)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-primary)",
          fontSize: "12px",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{displayText}</span>
        <span
          style={{
            fontSize: "10px",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-secondary)",
            border: "1px solid var(--bg-tertiary)",
            borderRadius: "var(--radius-sm)",
            marginTop: "4px",
            zIndex: 20,
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {options.map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleToggleOption(option)}
                style={{ accentColor: "var(--accent-blue)" }}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
