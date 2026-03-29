import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MapControls } from "./MapControls";

describe("MapControls", () => {
  it("renders its children", () => {
    render(
      <MapControls>
        <span>child one</span>
        <span>child two</span>
      </MapControls>,
    );
    expect(screen.getByText("child one")).toBeInTheDocument();
    expect(screen.getByText("child two")).toBeInTheDocument();
  });

  it("has absolute positioning at top-left with correct z-index", () => {
    const { container } = render(
      <MapControls>
        <span>child</span>
      </MapControls>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.position).toBe("absolute");
    expect(wrapper.style.top).toBe("12px");
    expect(wrapper.style.left).toBe("12px");
    expect(wrapper.style.zIndex).toBe("10");
  });

  it("lays out children in a flex column with gap", () => {
    const { container } = render(
      <MapControls>
        <span>child</span>
      </MapControls>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.display).toBe("flex");
    expect(wrapper.style.flexDirection).toBe("column");
    expect(wrapper.style.gap).toBe("8px");
  });
});
