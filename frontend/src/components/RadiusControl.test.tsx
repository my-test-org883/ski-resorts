import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RadiusControl } from "./RadiusControl";

describe("RadiusControl", () => {
  it("shows the Radius label", () => {
    render(<RadiusControl radiusKm={100} onChange={vi.fn()} />);
    expect(screen.getByText("Radius")).toBeInTheDocument();
  });

  it("displays the current radius value", () => {
    render(<RadiusControl radiusKm={250} onChange={vi.fn()} />);
    expect(screen.getByText("250 km")).toBeInTheDocument();
  });

  it("renders a range input with correct min, max, and step", () => {
    render(<RadiusControl radiusKm={100} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.min).toBe("50");
    expect(slider.max).toBe("500");
    expect(slider.step).toBe("50");
  });

  it("range input reflects the radiusKm prop as its value", () => {
    render(<RadiusControl radiusKm={150} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("150");
  });

  it("calls onChange with a numeric value when the slider changes", () => {
    const onChange = vi.fn();
    render(<RadiusControl radiusKm={100} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "200" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(200);
  });
});
