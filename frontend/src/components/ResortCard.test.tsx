import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Resort, ConditionScore } from "../types/resort";
import { SCORE_LABELS } from "../types/resort";
import { ResortCard } from "./ResortCard";

function makeResort(overrides: Partial<Resort> & { score?: ConditionScore } = {}): Resort {
  return {
    id: "test",
    name: "Test Resort",
    lat: 50.0,
    lng: -120.0,
    distanceKm: 100,
    elevation: 2000,
    condition: {
      score: overrides.score ?? "EXCELLENT",
      temperature: -5,
      freshSnowCm: 20,
      snowBaseCm: 100,
      windSpeedKmh: 15,
      freezeThawRisk: false,
    },
    ...overrides,
  };
}

describe("ResortCard", () => {
  describe("rendering resort data", () => {
    it("shows the resort name", () => {
      render(
        <ResortCard resort={makeResort({ name: "Whistler" })} selected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText("Whistler")).toBeInTheDocument();
    });

    it("shows the fresh snow amount", () => {
      render(
        <ResortCard resort={makeResort({ score: "GOOD" })} selected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText(/20cm/)).toBeInTheDocument();
    });

    it("shows the temperature", () => {
      render(
        <ResortCard resort={makeResort({ score: "FAIR" })} selected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText(/-5°/)).toBeInTheDocument();
    });

    it("shows the distance", () => {
      render(
        <ResortCard resort={makeResort({ distanceKm: 75 })} selected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText(/75 km away/)).toBeInTheDocument();
    });
  });

  describe("condition score labels", () => {
    const scores: ConditionScore[] = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

    scores.forEach((score) => {
      it(`shows "${SCORE_LABELS[score]}" label for score ${score}`, () => {
        render(<ResortCard resort={makeResort({ score })} selected={false} onClick={vi.fn()} />);
        expect(screen.getByText(SCORE_LABELS[score])).toBeInTheDocument();
      });
    });
  });

  describe("selected state", () => {
    it("uses bg-tertiary background when selected", () => {
      const { getByRole } = render(
        <ResortCard resort={makeResort()} selected={true} onClick={vi.fn()} />,
      );
      const btn = getByRole("button");
      expect(btn.getAttribute("style")).toContain("var(--bg-tertiary)");
    });

    it("uses bg-secondary background when not selected", () => {
      const { getByRole } = render(
        <ResortCard resort={makeResort()} selected={false} onClick={vi.fn()} />,
      );
      const btn = getByRole("button");
      expect(btn.getAttribute("style")).toContain("var(--bg-secondary)");
    });
  });

  describe("click handler", () => {
    it("calls onClick when the card is clicked", () => {
      const onClick = vi.fn();
      render(<ResortCard resort={makeResort()} selected={false} onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
