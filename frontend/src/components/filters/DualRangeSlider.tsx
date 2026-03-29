interface DualRangeSliderProps {
  label: string;
  min: number;
  max: number;
  valueLow: number;
  valueHigh: number;
  onChangeLow: (v: number) => void;
  onChangeHigh: (v: number) => void;
  unit?: string;
  step?: number;
}

export function DualRangeSlider({
  label,
  min,
  max,
  valueLow,
  valueHigh,
  onChangeLow,
  onChangeHigh,
  unit,
  step = 1,
}: DualRangeSliderProps) {
  const handleLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    onChangeLow(Math.min(raw, valueHigh));
  };

  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    onChangeHigh(Math.max(raw, valueLow));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-primary)",
            fontWeight: 600,
          }}
        >
          {valueLow} – {valueHigh}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div style={{ position: "relative", height: "20px" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueLow}
          onChange={handleLowChange}
          aria-label={`${label} minimum`}
          style={{
            position: "absolute",
            width: "100%",
            pointerEvents: "none",
            appearance: "none",
            background: "transparent",
            accentColor: "var(--accent-blue)",
            zIndex: 1,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueHigh}
          onChange={handleHighChange}
          aria-label={`${label} maximum`}
          style={{
            position: "absolute",
            width: "100%",
            pointerEvents: "none",
            appearance: "none",
            background: "transparent",
            accentColor: "var(--accent-blue)",
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}
