import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("renders the label", () => {
    render(<Toggle label="Night Skiing" checked={false} onChange={vi.fn()} />);
    expect(screen.getByText("Night Skiing")).toBeInTheDocument();
  });

  it("renders as a button for accessibility", () => {
    render(<Toggle label="Night Skiing" checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("has aria-checked=true when checked", () => {
    render(<Toggle label="Night Skiing" checked={true} onChange={vi.fn()} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("has aria-checked=false when unchecked", () => {
    render(<Toggle label="Night Skiing" checked={false} onChange={vi.fn()} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with true when clicked while unchecked", () => {
    const onChange = vi.fn();
    render(<Toggle label="Night Skiing" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when clicked while checked", () => {
    const onChange = vi.fn();
    render(<Toggle label="Night Skiing" checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("uses accent-blue background when checked", () => {
    render(<Toggle label="Night Skiing" checked={true} onChange={vi.fn()} />);
    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("style")).toContain("var(--accent-blue)");
  });

  it("uses bg-tertiary background when unchecked", () => {
    render(<Toggle label="Night Skiing" checked={false} onChange={vi.fn()} />);
    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("style")).toContain("var(--bg-tertiary)");
  });

  it("has an accessible label via aria-label", () => {
    render(<Toggle label="Night Skiing" checked={false} onChange={vi.fn()} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-label", "Night Skiing");
  });
});
