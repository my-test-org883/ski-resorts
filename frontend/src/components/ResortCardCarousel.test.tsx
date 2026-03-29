import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Resort, ConditionScore } from "../types/resort";
import { ResortCardCarousel } from "./ResortCardCarousel";

function makeResort(overrides: Partial<Resort> & { score?: ConditionScore } = {}): Resort {
  return {
    id: overrides.id ?? "test",
    name: overrides.name ?? "Test Resort",
    lat: 50.0,
    lng: -120.0,
    distanceKm: 100,
    elevation: 2000,
    country: null,
    region: null,
    minElevation: null,
    maxElevation: null,
    vertical: null,
    totalRunLengthKm: null,
    runCount: null,
    liftCount: null,
    easyRuns: null,
    intermediateRuns: null,
    advancedRuns: null,
    expertRuns: null,
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

describe("ResortCardCarousel", () => {
  describe("empty state", () => {
    it("shows the no-resorts message when given an empty array with no active filters", () => {
      render(
        <ResortCardCarousel
          resorts={[]}
          selectedId={null}
          onSelect={vi.fn()}
          hasActiveFilters={false}
        />,
      );
      expect(screen.getByText(/No resorts found within this radius/)).toBeInTheDocument();
    });

    it("shows filter-specific empty message when resorts are empty and filters are active", () => {
      render(
        <ResortCardCarousel
          resorts={[]}
          selectedId={null}
          onSelect={vi.fn()}
          hasActiveFilters={true}
        />,
      );
      expect(screen.getByText(/No resorts match your filters/)).toBeInTheDocument();
    });

    it("does not show the radius message when filters are active", () => {
      render(
        <ResortCardCarousel
          resorts={[]}
          selectedId={null}
          onSelect={vi.fn()}
          hasActiveFilters={true}
        />,
      );
      expect(screen.queryByText(/No resorts found within this radius/)).not.toBeInTheDocument();
    });

    it("shows a reset hint when filters are active and empty", () => {
      render(
        <ResortCardCarousel
          resorts={[]}
          selectedId={null}
          onSelect={vi.fn()}
          hasActiveFilters={true}
        />,
      );
      expect(screen.getByText(/reset/i)).toBeInTheDocument();
    });

    it("calls onResetFilters when reset hint is clicked", () => {
      const onResetFilters = vi.fn();
      render(
        <ResortCardCarousel
          resorts={[]}
          selectedId={null}
          onSelect={vi.fn()}
          hasActiveFilters={true}
          onResetFilters={onResetFilters}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /reset/i }));
      expect(onResetFilters).toHaveBeenCalledOnce();
    });

    it("shows the radius message when given an empty array and hasActiveFilters defaults to false", () => {
      render(<ResortCardCarousel resorts={[]} selectedId={null} onSelect={vi.fn()} />);
      expect(screen.getByText(/No resorts found within this radius/)).toBeInTheDocument();
    });
  });

  describe("with resorts", () => {
    it("renders a card for each resort", () => {
      const resorts = [
        makeResort({ id: "r1", name: "Alpha Resort", score: "GOOD" }),
        makeResort({ id: "r2", name: "Beta Resort", score: "FAIR" }),
      ];
      render(<ResortCardCarousel resorts={resorts} selectedId={null} onSelect={vi.fn()} />);
      expect(screen.getByText("Alpha Resort")).toBeInTheDocument();
      expect(screen.getByText("Beta Resort")).toBeInTheDocument();
    });

    it("sorts resorts so EXCELLENT appears before POOR", () => {
      const resorts = [
        makeResort({ id: "r1", name: "Poor Resort", score: "POOR" }),
        makeResort({ id: "r2", name: "Excellent Resort", score: "EXCELLENT" }),
      ];
      render(<ResortCardCarousel resorts={resorts} selectedId={null} onSelect={vi.fn()} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Excellent Resort");
      expect(buttons[1]).toHaveTextContent("Poor Resort");
    });

    it("sorts in full order: EXCELLENT, GOOD, FAIR, POOR", () => {
      const resorts = [
        makeResort({ id: "r4", name: "Poor", score: "POOR" }),
        makeResort({ id: "r2", name: "Good", score: "GOOD" }),
        makeResort({ id: "r3", name: "Fair", score: "FAIR" }),
        makeResort({ id: "r1", name: "Excellent", score: "EXCELLENT" }),
      ];
      render(<ResortCardCarousel resorts={resorts} selectedId={null} onSelect={vi.fn()} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Excellent");
      expect(buttons[1]).toHaveTextContent("Good");
      expect(buttons[2]).toHaveTextContent("Fair");
      expect(buttons[3]).toHaveTextContent("Poor");
    });

    it("passes selected=true to the card matching selectedId", () => {
      const resorts = [
        makeResort({ id: "r1", name: "Alpha", score: "GOOD" }),
        makeResort({ id: "r2", name: "Beta", score: "GOOD" }),
      ];
      render(<ResortCardCarousel resorts={resorts} selectedId="r1" onSelect={vi.fn()} />);
      const buttons = screen.getAllByRole("button");
      const alphaBtn = buttons.find((b) => b.textContent?.includes("Alpha"))!;
      const betaBtn = buttons.find((b) => b.textContent?.includes("Beta"))!;
      expect(alphaBtn.getAttribute("style")).toContain("var(--bg-tertiary)");
      expect(betaBtn.getAttribute("style")).toContain("var(--bg-secondary)");
    });

    it("passes selected=false to all cards when selectedId is null", () => {
      const resorts = [makeResort({ id: "r1", name: "Alpha", score: "GOOD" })];
      render(<ResortCardCarousel resorts={resorts} selectedId={null} onSelect={vi.fn()} />);
      const btn = screen.getByRole("button");
      expect(btn.getAttribute("style")).toContain("var(--bg-secondary)");
    });

    it("calls onSelect with the clicked resort object", () => {
      const onSelect = vi.fn();
      const resort = makeResort({ id: "r1", name: "Alpha", score: "GOOD" });
      render(<ResortCardCarousel resorts={[resort]} selectedId={null} onSelect={onSelect} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(resort);
    });
  });
});
