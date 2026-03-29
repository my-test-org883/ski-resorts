import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConditionChips } from "./ConditionChips";

describe("ConditionChips", () => {
  it("renders a chip for each condition score", () => {
    render(<ConditionChips selected={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /excellent/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /good/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fair/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /poor/i })).toBeInTheDocument();
  });

  it("renders 4 chips total", () => {
    render(<ConditionChips selected={[]} onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("marks selected chips with aria-pressed=true", () => {
    render(<ConditionChips selected={["EXCELLENT", "POOR"]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /poor/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("marks unselected chips with aria-pressed=false", () => {
    render(<ConditionChips selected={["EXCELLENT"]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /good/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /fair/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /poor/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange adding a score when an unselected chip is clicked", () => {
    const onChange = vi.fn();
    render(<ConditionChips selected={["GOOD"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(["GOOD", "EXCELLENT"]));
    expect(onChange.mock.calls[0]![0]).toHaveLength(2);
  });

  it("calls onChange removing a score when a selected chip is clicked", () => {
    const onChange = vi.fn();
    render(<ConditionChips selected={["GOOD", "FAIR"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["FAIR"]);
  });

  it("calls onChange with empty array when last selected chip is clicked", () => {
    const onChange = vi.fn();
    render(<ConditionChips selected={["EXCELLENT"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("uses SCORE_COLORS to apply color styling to chips", () => {
    render(<ConditionChips selected={[]} onChange={vi.fn()} />);
    // jsdom converts hex colors to rgb in style attributes
    const excellentBtn = screen.getByRole("button", { name: /excellent/i });
    const style = excellentBtn.getAttribute("style") ?? "";
    // #22c55e = rgb(34, 197, 94)
    expect(style).toContain("rgb(34, 197, 94)");
  });

  it("applies distinct style to selected vs unselected chips", () => {
    render(<ConditionChips selected={["EXCELLENT"]} onChange={vi.fn()} />);
    const selectedBtn = screen.getByRole("button", { name: /excellent/i });
    const unselectedBtn = screen.getByRole("button", { name: /good/i });
    const selectedStyle = selectedBtn.getAttribute("style") ?? "";
    const unselectedStyle = unselectedBtn.getAttribute("style") ?? "";
    expect(selectedStyle).not.toBe(unselectedStyle);
  });
});
