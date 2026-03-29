import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    rerender({ value: "updated", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("initial");
  });

  it("updates after the delay elapses", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    rerender({ value: "updated", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("resets the timer when value changes before delay elapses", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    rerender({ value: "first", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "second", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Only 200ms of the second debounce has passed — should still be initial
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Now 300ms after "second" was set — should be debounced
    expect(result.current).toBe("second");
  });

  it("works with non-string generic types", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue<number>(value, delay),
      { initialProps: { value: 0, delay: 100 } },
    );

    rerender({ value: 42, delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });
});
