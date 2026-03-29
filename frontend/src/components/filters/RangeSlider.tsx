interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
}

export function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  unit,
  step = 1,
}: RangeSliderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <label
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
          minWidth: "60px",
        }}
      >
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ flex: 1, accentColor: "var(--accent-blue)" }}
      />
      <span
        style={{
          fontSize: "12px",
          color: "var(--text-primary)",
          fontWeight: 600,
          minWidth: "45px",
          textAlign: "right",
        }}
      >
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}
