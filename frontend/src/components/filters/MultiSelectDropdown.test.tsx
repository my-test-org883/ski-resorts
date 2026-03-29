import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

describe("MultiSelectDropdown", () => {
  const defaultProps = {
    label: "Countries",
    options: ["Canada", "France", "Switzerland"],
    selected: [] as string[],
    onChange: vi.fn(),
  };

  it("renders the label", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    expect(screen.getByText("Countries")).toBeInTheDocument();
  });

  it("shows placeholder when nothing is selected", () => {
    render(<MultiSelectDropdown {...defaultProps} placeholder="Select countries" />);
    expect(screen.getByText("Select countries")).toBeInTheDocument();
  });

  it("shows default placeholder when none provided and nothing selected", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    expect(screen.getByText("Any")).toBeInTheDocument();
  });

  it("shows count of selected items", () => {
    render(<MultiSelectDropdown {...defaultProps} selected={["Canada", "France"]} />);
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("does not show options by default", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows options when trigger button is clicked", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renders each option as a labeled checkbox", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByLabelText("Canada")).toBeInTheDocument();
    expect(screen.getByLabelText("France")).toBeInTheDocument();
    expect(screen.getByLabelText("Switzerland")).toBeInTheDocument();
  });

  it("checks boxes for selected items", () => {
    render(<MultiSelectDropdown {...defaultProps} selected={["France"]} />);
    fireEvent.click(screen.getByRole("button"));
    const franceCheckbox = screen.getByLabelText("France") as HTMLInputElement;
    const canadaCheckbox = screen.getByLabelText("Canada") as HTMLInputElement;
    expect(franceCheckbox.checked).toBe(true);
    expect(canadaCheckbox.checked).toBe(false);
  });

  it("calls onChange adding an item when unchecked option is clicked", () => {
    const onChange = vi.fn();
    render(<MultiSelectDropdown {...defaultProps} selected={["France"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByLabelText("Canada"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["France", "Canada"]);
  });

  it("calls onChange removing an item when checked option is clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiSelectDropdown {...defaultProps} selected={["France", "Canada"]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByLabelText("France"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["Canada"]);
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <span data-testid="outside">Outside</span>
        <MultiSelectDropdown {...defaultProps} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("hides dropdown when clicking trigger again", () => {
    render(<MultiSelectDropdown {...defaultProps} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);

    fireEvent.click(button);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
