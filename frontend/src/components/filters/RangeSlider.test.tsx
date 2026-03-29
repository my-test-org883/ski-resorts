import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RangeSlider } from "./RangeSlider";

describe("RangeSlider", () => {
  it("renders the label", () => {
    render(<RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={vi.fn()} />);
    expect(screen.getByText("Elevation")).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={vi.fn()} />);
    expect(screen.getByText("1500")).toBeInTheDocument();
  });

  it("displays the current value with unit", () => {
    render(
      <RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={vi.fn()} unit="m" />,
    );
    expect(screen.getByText("1500 m")).toBeInTheDocument();
  });

  it("renders a range input with correct min, max, and step", () => {
    render(
      <RangeSlider
        label="Elevation"
        min={0}
        max={4000}
        value={1500}
        onChange={vi.fn()}
        step={100}
      />,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("4000");
    expect(slider.step).toBe("100");
  });

  it("uses step=1 by default", () => {
    render(<RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.step).toBe("1");
  });

  it("reflects the value prop on the input", () => {
    render(<RangeSlider label="Elevation" min={0} max={4000} value={2500} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("2500");
  });

  it("calls onChange with numeric value when slider changes", () => {
    const onChange = vi.fn();
    render(<RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "3000" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(3000);
  });

  it("slider has an accessible label via aria-label", () => {
    render(<RangeSlider label="Elevation" min={0} max={4000} value={1500} onChange={vi.fn()} />);
    expect(screen.getByRole("slider", { name: "Elevation" })).toBeInTheDocument();
  });
});
