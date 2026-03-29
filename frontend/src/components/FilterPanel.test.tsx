import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterPanel } from "./FilterPanel";
import { DEFAULT_FILTER_STATE } from "../types/filters";
import type { FilterState } from "../types/filters";

const defaultProps = {
  isOpen: true,
  filters: DEFAULT_FILTER_STATE,
  onUpdateFilter: vi.fn(),
  onReset: vi.fn(),
  onClose: vi.fn(),
  activeFilterCount: 0,
  countryOptions: ["France", "Austria", "Switzerland"],
};

describe("FilterPanel", () => {
  // --- Layout ---
  it("renders a panel container", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders the Filters heading", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("renders a Reset button", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("renders a close button", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls onReset when Reset is clicked", () => {
    const onReset = vi.fn();
    render(<FilterPanel {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<FilterPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not show active count badge when count is 0", () => {
    render(<FilterPanel {...defaultProps} activeFilterCount={0} />);
    expect(screen.queryByTestId("active-count-badge")).not.toBeInTheDocument();
  });

  it("shows active count badge with count when > 0", () => {
    render(<FilterPanel {...defaultProps} activeFilterCount={4} />);
    expect(screen.getByTestId("active-count-badge")).toHaveTextContent("4");
  });

  // --- Sections ---
  it("renders a Conditions filter section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Conditions")).toBeInTheDocument();
  });

  it("renders a Resort filter section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Resort")).toBeInTheDocument();
  });

  it("renders a Terrain filter section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Terrain")).toBeInTheDocument();
  });

  // --- Conditions section ---
  it("renders ConditionChips inside Conditions section", () => {
    render(<FilterPanel {...defaultProps} />);
    // EXCELLENT chip from ConditionChips
    expect(screen.getByRole("button", { name: /excellent/i })).toBeInTheDocument();
  });

  it("renders freeze-thaw toggle in Conditions section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("switch", { name: /freeze/i })).toBeInTheDocument();
  });

  it("calls onUpdateFilter with conditionScores when chip is clicked", () => {
    const onUpdateFilter = vi.fn();
    render(<FilterPanel {...defaultProps} onUpdateFilter={onUpdateFilter} />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    expect(onUpdateFilter).toHaveBeenCalledWith("conditionScores", ["EXCELLENT"]);
  });

  it("calls onUpdateFilter with hideFreezeThawRisk when toggle is clicked", () => {
    const onUpdateFilter = vi.fn();
    render(<FilterPanel {...defaultProps} onUpdateFilter={onUpdateFilter} />);
    fireEvent.click(screen.getByRole("switch", { name: /freeze/i }));
    expect(onUpdateFilter).toHaveBeenCalledWith("hideFreezeThawRisk", true);
  });

  // --- Resort section ---
  it("renders country MultiSelectDropdown in Resort section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Country")).toBeInTheDocument();
  });

  // --- Terrain section ---
  it("renders easy runs toggle in Terrain section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("switch", { name: /easy/i })).toBeInTheDocument();
  });

  it("renders intermediate runs toggle in Terrain section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("switch", { name: /intermediate/i })).toBeInTheDocument();
  });

  it("renders advanced runs toggle in Terrain section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("switch", { name: /advanced/i })).toBeInTheDocument();
  });

  it("renders expert runs toggle in Terrain section", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole("switch", { name: /expert/i })).toBeInTheDocument();
  });

  it("calls onUpdateFilter with hasEasyRuns when easy toggle is clicked", () => {
    const onUpdateFilter = vi.fn();
    render(<FilterPanel {...defaultProps} onUpdateFilter={onUpdateFilter} />);
    fireEvent.click(screen.getByRole("switch", { name: /easy/i }));
    expect(onUpdateFilter).toHaveBeenCalledWith("hasEasyRuns", true);
  });

  // --- Slide animation ---
  it("has a panel element that is 320px wide", () => {
    render(<FilterPanel {...defaultProps} />);
    const panel = screen.getByRole("complementary");
    const style = panel.getAttribute("style") ?? "";
    expect(style).toContain("320px");
  });

  it("applies a CSS transition on the panel for slide animation", () => {
    render(<FilterPanel {...defaultProps} />);
    const panel = screen.getByRole("complementary");
    const style = panel.getAttribute("style") ?? "";
    expect(style).toContain("transition");
  });

  it("panel has translateX(0) transform when open", () => {
    render(<FilterPanel {...defaultProps} isOpen={true} />);
    const panel = screen.getByRole("complementary");
    const style = panel.getAttribute("style") ?? "";
    expect(style).toContain("translateX(0)");
  });

  it("panel has translateX(-100%) transform when closed", () => {
    render(<FilterPanel {...defaultProps} isOpen={false} />);
    const panel = screen.getByRole("complementary", { hidden: true });
    const style = panel.getAttribute("style") ?? "";
    expect(style).toContain("translateX(-100%)");
  });

  it("panel has aria-hidden when closed", () => {
    render(<FilterPanel {...defaultProps} isOpen={false} />);
    const panel = screen.getByRole("complementary", { hidden: true });
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<FilterPanel {...defaultProps} onClose={onClose} isOpen={true} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a backdrop overlay", () => {
    render(<FilterPanel {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId("filter-backdrop")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<FilterPanel {...defaultProps} onClose={onClose} isOpen={true} />);
    fireEvent.click(screen.getByTestId("filter-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  // --- Props reflected ---
  it("reflects filter state to ConditionChips selected prop", () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, conditionScores: ["GOOD"] };
    render(<FilterPanel {...defaultProps} filters={filters} />);
    expect(screen.getByRole("button", { name: /good/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reflects hideFreezeThawRisk to toggle checked state", () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, hideFreezeThawRisk: true };
    render(<FilterPanel {...defaultProps} filters={filters} />);
    expect(screen.getByRole("switch", { name: /freeze/i })).toHaveAttribute("aria-checked", "true");
  });
});
