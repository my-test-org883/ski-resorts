import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterToggleButton } from "./FilterToggleButton";

describe("FilterToggleButton", () => {
  it("renders a button", () => {
    render(<FilterToggleButton activeFilterCount={0} onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<FilterToggleButton activeFilterCount={0} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /filter/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<FilterToggleButton activeFilterCount={0} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not show a badge when activeFilterCount is 0", () => {
    render(<FilterToggleButton activeFilterCount={0} onClick={vi.fn()} />);
    expect(screen.queryByTestId("filter-badge")).not.toBeInTheDocument();
  });

  it("shows a badge when activeFilterCount is greater than 0", () => {
    render(<FilterToggleButton activeFilterCount={3} onClick={vi.fn()} />);
    expect(screen.getByTestId("filter-badge")).toBeInTheDocument();
  });

  it("displays the active filter count in the badge", () => {
    render(<FilterToggleButton activeFilterCount={5} onClick={vi.fn()} />);
    expect(screen.getByTestId("filter-badge")).toHaveTextContent("5");
  });

  it("updates badge when count changes from 0 to positive", () => {
    const { rerender } = render(<FilterToggleButton activeFilterCount={0} onClick={vi.fn()} />);
    expect(screen.queryByTestId("filter-badge")).not.toBeInTheDocument();
    rerender(<FilterToggleButton activeFilterCount={2} onClick={vi.fn()} />);
    expect(screen.getByTestId("filter-badge")).toHaveTextContent("2");
  });
});
