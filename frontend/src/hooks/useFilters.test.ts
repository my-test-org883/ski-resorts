import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFilters } from "./useFilters";
import { DEFAULT_FILTER_STATE } from "../types/filters";

describe("useFilters — initial state", () => {
  it("starts with DEFAULT_FILTER_STATE", () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
  });

  it("starts with activeFilterCount of 0", () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.activeFilterCount).toBe(0);
  });
});

describe("useFilters — updateFilter", () => {
  it("updates a single boolean field", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("hideFreezeThawRisk", true);
    });
    expect(result.current.filters.hideFreezeThawRisk).toBe(true);
  });

  it("updates a numeric field", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 20);
    });
    expect(result.current.filters.freshSnowMinCm).toBe(20);
  });

  it("updates an array field", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("conditionScores", ["EXCELLENT", "GOOD"]);
    });
    expect(result.current.filters.conditionScores).toEqual(["EXCELLENT", "GOOD"]);
  });

  it("preserves other fields when updating one", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 10);
    });
    expect(result.current.filters.temperatureMin).toBe(DEFAULT_FILTER_STATE.temperatureMin);
    expect(result.current.filters.conditionScores).toEqual(DEFAULT_FILTER_STATE.conditionScores);
  });
});

describe("useFilters — resetFilters", () => {
  it("resets all fields back to defaults", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 30);
      result.current.updateFilter("hideFreezeThawRisk", true);
      result.current.updateFilter("conditionScores", ["POOR"]);
    });
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
  });

  it("resets activeFilterCount to 0", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 30);
    });
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.activeFilterCount).toBe(0);
  });
});

describe("useFilters — activeFilterCount", () => {
  it("counts one filter when freshSnowMinCm is non-zero", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 5);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts one filter when hideFreezeThawRisk is true", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("hideFreezeThawRisk", true);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts one filter when conditionScores is non-empty", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("conditionScores", ["GOOD"]);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts one filter when countries is non-empty", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("countries", ["CA"]);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts multiple filters independently", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("freshSnowMinCm", 10);
      result.current.updateFilter("hideFreezeThawRisk", true);
      result.current.updateFilter("conditionScores", ["EXCELLENT"]);
    });
    expect(result.current.activeFilterCount).toBe(3);
  });

  it("does not count temperatureMin when it equals the default", () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("counts temperatureMin when it differs from default", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("temperatureMin", -10);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts temperatureMax when it differs from default", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("temperatureMax", 5);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("counts boolean terrain flags only when true", () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter("hasExpertRuns", true);
    });
    expect(result.current.activeFilterCount).toBe(1);
  });
});
