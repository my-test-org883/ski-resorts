import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoadingScreen } from "./LoadingScreen";

describe("LoadingScreen", () => {
  describe("loading state (no error)", () => {
    it("shows the heading", () => {
      render(<LoadingScreen message="Loading data..." />);
      expect(screen.getByText("Ski Resort Finder")).toBeInTheDocument();
    });

    it("shows the message", () => {
      render(<LoadingScreen message="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("shows the spinner (animated div)", () => {
      const { container } = render(<LoadingScreen message="Loading data..." />);
      const spinner = container.querySelector('div[style*="border-radius: 50%"]');
      expect(spinner).toBeInTheDocument();
    });

    it("does not show an error paragraph or Try Again button", () => {
      render(<LoadingScreen message="Loading data..." />);
      expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    });
  });

  describe("error state", () => {
    it("shows the error text", () => {
      render(<LoadingScreen message="Loading..." error="Something went wrong" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("does not show the spinner when error is present", () => {
      const { container } = render(<LoadingScreen message="Loading..." error="Oops" />);
      const spinner = container.querySelector('div[style*="border-radius: 50%"]');
      expect(spinner).toBeNull();
    });

    it("does not show the loading message when error is present", () => {
      render(<LoadingScreen message="Loading..." error="Oops" />);
      expect(screen.queryByText("Loading...")).toBeNull();
    });
  });

  describe("error state with onRetry", () => {
    it("shows the Try Again button", () => {
      const onRetry = vi.fn();
      render(<LoadingScreen message="Loading..." error="Failed" onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("calls onRetry when Try Again is clicked", () => {
      const onRetry = vi.fn();
      render(<LoadingScreen message="Loading..." error="Failed" onRetry={onRetry} />);
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe("error state without onRetry", () => {
    it("does not show the Try Again button", () => {
      render(<LoadingScreen message="Loading..." error="Failed" />);
      expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    });
  });

  describe("error falsy values", () => {
    it("shows spinner when error is null", () => {
      const { container } = render(<LoadingScreen message="Loading..." error={null} />);
      const spinner = container.querySelector('div[style*="border-radius: 50%"]');
      expect(spinner).toBeInTheDocument();
    });
  });
});
