import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FilterSection } from "./FilterSection";

describe("FilterSection", () => {
  it("renders the title", () => {
    render(<FilterSection title="Snow Conditions">content</FilterSection>);
    expect(screen.getByText("Snow Conditions")).toBeInTheDocument();
  });

  it("renders children when defaultOpen is true", () => {
    render(
      <FilterSection title="Test" defaultOpen>
        <span>Inner Content</span>
      </FilterSection>,
    );
    expect(screen.getByText("Inner Content")).toBeVisible();
  });

  it("hides children by default when defaultOpen is not set", () => {
    render(
      <FilterSection title="Test">
        <span>Hidden Content</span>
      </FilterSection>,
    );
    const content = screen.getByText("Hidden Content");
    expect(content.closest('[data-collapsed="true"]')).toBeInTheDocument();
  });

  it("toggles children visibility when title is clicked", () => {
    render(
      <FilterSection title="Toggle Me">
        <span>Toggled Content</span>
      </FilterSection>,
    );

    const button = screen.getByRole("button", { name: /toggle me/i });
    fireEvent.click(button);

    const content = screen.getByText("Toggled Content");
    expect(content.closest('[data-collapsed="false"]')).toBeInTheDocument();
  });

  it("collapses when clicking title of an open section", () => {
    render(
      <FilterSection title="Collapse Me" defaultOpen>
        <span>Collapsible Content</span>
      </FilterSection>,
    );

    const button = screen.getByRole("button", { name: /collapse me/i });
    fireEvent.click(button);

    const content = screen.getByText("Collapsible Content");
    expect(content.closest('[data-collapsed="true"]')).toBeInTheDocument();
  });

  it("renders a chevron indicator", () => {
    render(<FilterSection title="With Chevron">content</FilterSection>);
    const chevron = screen.getByTestId("filter-section-chevron");
    expect(chevron).toBeInTheDocument();
  });

  it("rotates chevron when expanded", () => {
    render(
      <FilterSection title="Chevron Test" defaultOpen>
        content
      </FilterSection>,
    );
    const chevron = screen.getByTestId("filter-section-chevron");
    expect(chevron.getAttribute("style")).toContain("rotate(180deg)");
  });

  it("does not rotate chevron when collapsed", () => {
    render(<FilterSection title="Chevron Test">content</FilterSection>);
    const chevron = screen.getByTestId("filter-section-chevron");
    expect(chevron.getAttribute("style")).toContain("rotate(0deg)");
  });

  it("button has aria-expanded=false when collapsed", () => {
    render(<FilterSection title="Aria Test">content</FilterSection>);
    const button = screen.getByRole("button", { name: /aria test/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("button has aria-expanded=true when expanded", () => {
    render(
      <FilterSection title="Aria Test" defaultOpen>
        content
      </FilterSection>,
    );
    const button = screen.getByRole("button", { name: /aria test/i });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("aria-expanded updates after toggle", () => {
    render(<FilterSection title="Aria Test">content</FilterSection>);
    const button = screen.getByRole("button", { name: /aria test/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
