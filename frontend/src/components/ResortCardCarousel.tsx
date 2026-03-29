import { useRef, useCallback, useEffect } from "react";
import type { Resort } from "../types/resort";
import { ResortCard } from "./ResortCard";

interface ResortCardCarouselProps {
  resorts: Resort[];
  selectedId: string | null;
  onSelect: (resort: Resort) => void;
}

export function ResortCardCarousel({ resorts, selectedId, onSelect }: ResortCardCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.deltaY !== 0) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  useEffect(() => {
    if (!selectedId || !scrollRef.current) return;
    const card = scrollRef.current.querySelector(`[data-resort-id="${selectedId}"]`);
    if (card && typeof card.scrollIntoView === "function") {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedId]);

  if (resorts.length === 0) {
    return (
      <div
        style={{
          padding: "16px 20px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--bg-tertiary)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        No resorts found within this radius. Try increasing the search distance.
      </div>
    );
  }

  const scoreOrder = { EXCELLENT: 0, GOOD: 1, FAIR: 2, POOR: 3 } as const;
  const sorted = [...resorts].sort(
    (a, b) => scoreOrder[a.condition.score] - scoreOrder[b.condition.score],
  );

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      style={{
        display: "flex",
        gap: "10px",
        padding: "12px 16px",
        overflowX: "auto",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--bg-tertiary)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {sorted.map((resort) => (
        <div key={resort.id} data-resort-id={resort.id}>
          <ResortCard
            resort={resort}
            selected={resort.id === selectedId}
            onClick={() => onSelect(resort)}
          />
        </div>
      ))}
    </div>
  );
}
