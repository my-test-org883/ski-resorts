import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DualRangeSlider } from "./DualRangeSlider";

describe("DualRangeSlider", () => {
  const defaultProps = {
    label: "Elevation",
    min: 0,
    max: 4000,
    valueLow: 1000,
    valueHigh: 3000,
    onChangeLow: vi.fn(),
    onChangeHigh: vi.fn(),
  };

  it("renders the label", () => {
    render(<DualRangeSlider {...defaultProps} />);
    expect(screen.getByText("Elevation")).toBeInTheDocument();
  });

  it("displays both values without unit", () => {
    render(<DualRangeSlider {...defaultProps} />);
    expect(screen.getByText("1000 – 3000")).toBeInTheDocument();
  });

  it("displays both values with unit", () => {
    render(<DualRangeSlider {...defaultProps} unit="m" />);
    expect(screen.getByText("1000 – 3000 m")).toBeInTheDocument();
  });

  it("renders two range inputs", () => {
    render(<DualRangeSlider {...defaultProps} />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
  });

  it("sets correct min and max on both inputs", () => {
    render(<DualRangeSlider {...defaultProps} />);
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders[0]!.min).toBe("0");
    expect(sliders[0]!.max).toBe("4000");
    expect(sliders[1]!.min).toBe("0");
    expect(sliders[1]!.max).toBe("4000");
  });

  it("reflects valueLow and valueHigh on inputs", () => {
    render(<DualRangeSlider {...defaultProps} />);
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders[0]!.value).toBe("1000");
    expect(sliders[1]!.value).toBe("3000");
  });

  it("calls onChangeLow when low slider changes", () => {
    const onChangeLow = vi.fn();
    render(<DualRangeSlider {...defaultProps} onChangeLow={onChangeLow} />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0]!, { target: { value: "500" } });
    expect(onChangeLow).toHaveBeenCalledOnce();
    expect(onChangeLow).toHaveBeenCalledWith(500);
  });

  it("calls onChangeHigh when high slider changes", () => {
    const onChangeHigh = vi.fn();
    render(<DualRangeSlider {...defaultProps} onChangeHigh={onChangeHigh} />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[1]!, { target: { value: "3500" } });
    expect(onChangeHigh).toHaveBeenCalledOnce();
    expect(onChangeHigh).toHaveBeenCalledWith(3500);
  });

  it("clamps low value so it does not exceed high", () => {
    const onChangeLow = vi.fn();
    render(
      <DualRangeSlider
        {...defaultProps}
        valueLow={1000}
        valueHigh={2000}
        onChangeLow={onChangeLow}
      />,
    );
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0]!, { target: { value: "2500" } });
    expect(onChangeLow).toHaveBeenCalledWith(2000);
  });

  it("clamps high value so it does not go below low", () => {
    const onChangeHigh = vi.fn();
    render(
      <DualRangeSlider
        {...defaultProps}
        valueLow={1000}
        valueHigh={2000}
        onChangeHigh={onChangeHigh}
      />,
    );
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[1]!, { target: { value: "500" } });
    expect(onChangeHigh).toHaveBeenCalledWith(1000);
  });

  it("uses step prop on both inputs", () => {
    render(<DualRangeSlider {...defaultProps} step={50} />);
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders[0]!.step).toBe("50");
    expect(sliders[1]!.step).toBe("50");
  });

  it("uses step=1 by default", () => {
    render(<DualRangeSlider {...defaultProps} />);
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders[0]!.step).toBe("1");
    expect(sliders[1]!.step).toBe("1");
  });
});
