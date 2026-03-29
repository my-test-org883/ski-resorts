import type { ConditionScore } from "../../types/filters";
import { SCORE_COLORS, SCORE_LABELS } from "../../types/resort";

const SCORES: ConditionScore[] = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

interface ConditionChipsProps {
  selected: ConditionScore[];
  onChange: (scores: ConditionScore[]) => void;
}

export function ConditionChips({ selected, onChange }: ConditionChipsProps) {
  const handleToggle = (score: ConditionScore) => {
    if (selected.includes(score)) {
      onChange(selected.filter((s) => s !== score));
    } else {
      onChange([...selected, score]);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {SCORES.map((score) => {
        const isSelected = selected.includes(score);
        const color = SCORE_COLORS[score];
        return (
          <button
            key={score}
            aria-pressed={isSelected}
            onClick={() => handleToggle(score)}
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              border: `1px solid ${color}`,
              background: isSelected ? color : "transparent",
              color: isSelected ? "#fff" : color,
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.3px",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {SCORE_LABELS[score]}
          </button>
        );
      })}
    </div>
  );
}
