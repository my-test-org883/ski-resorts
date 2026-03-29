import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFilteredResorts } from "./useFilteredResorts";
import { DEFAULT_FILTER_STATE } from "../types/filters";
import type { FilterState } from "../types/filters";
import type { Resort } from "../types/resort";

function makeResort(overrides: Partial<Resort> = {}): Resort {
  return {
    id: "r1",
    name: "Test Resort",
    lat: 50.0,
    lng: -120.0,
    distanceKm: 100,
    elevation: 2000,
    country: "CA",
    region: "BC",
    minElevation: 1200,
    maxElevation: 2400,
    vertical: 1200,
    totalRunLengthKm: 80,
    runCount: 100,
    liftCount: 12,
    easyRuns: 20,
    intermediateRuns: 50,
    advancedRuns: 25,
    expertRuns: 5,
    condition: {
      score: "EXCELLENT",
      temperature: -5,
      freshSnowCm: 30,
      snowBaseCm: 200,
      windSpeedKmh: 20,
      freezeThawRisk: false,
    },
    ...overrides,
  };
}

function withFilter(overrides: Partial<FilterState>): FilterState {
  return { ...DEFAULT_FILTER_STATE, ...overrides };
}

describe("useFilteredResorts — no-op", () => {
  it("returns all resorts when filters are at defaults", () => {
    const resorts = [makeResort({ id: "r1" }), makeResort({ id: "r2" })];
    const { result } = renderHook(() => useFilteredResorts(resorts, DEFAULT_FILTER_STATE));
    expect(result.current).toHaveLength(2);
  });

  it("returns empty array when given no resorts", () => {
    const { result } = renderHook(() => useFilteredResorts([], DEFAULT_FILTER_STATE));
    expect(result.current).toHaveLength(0);
  });
});

describe("useFilteredResorts — conditionScores", () => {
  it("keeps resorts whose score is in the list", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, score: "EXCELLENT" } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, score: "POOR" } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ conditionScores: ["EXCELLENT"] })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r1");
  });

  it("allows multiple scores", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, score: "EXCELLENT" } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, score: "GOOD" } }),
      makeResort({ id: "r3", condition: { ...makeResort().condition, score: "POOR" } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ conditionScores: ["EXCELLENT", "GOOD"] })),
    );
    expect(result.current).toHaveLength(2);
  });

  it("passes all through when conditionScores is empty", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, score: "EXCELLENT" } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, score: "POOR" } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ conditionScores: [] })),
    );
    expect(result.current).toHaveLength(2);
  });
});

describe("useFilteredResorts — freshSnowMinCm", () => {
  it("excludes resorts below the minimum", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, freshSnowCm: 5 } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, freshSnowCm: 25 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ freshSnowMinCm: 10 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("includes resort exactly at the minimum", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, freshSnowCm: 10 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ freshSnowMinCm: 10 })),
    );
    expect(result.current).toHaveLength(1);
  });

  it("passes all through when freshSnowMinCm is 0", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, freshSnowCm: 0 } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, freshSnowCm: 50 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ freshSnowMinCm: 0 })),
    );
    expect(result.current).toHaveLength(2);
  });
});

describe("useFilteredResorts — temperature range", () => {
  it("excludes resort below temperatureMin", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, temperature: -20 } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, temperature: -5 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ temperatureMin: -10 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("excludes resort above temperatureMax", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, temperature: 5 } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, temperature: -5 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ temperatureMax: 0 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("includes resort exactly at temperatureMin and temperatureMax", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, temperature: -10 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ temperatureMin: -10, temperatureMax: -10 })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — maxWindSpeedKmh", () => {
  it("excludes resorts above max wind speed", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, windSpeedKmh: 80 } }),
      makeResort({ id: "r2", condition: { ...makeResort().condition, windSpeedKmh: 30 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ maxWindSpeedKmh: 50 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("includes resort exactly at maxWindSpeedKmh", () => {
    const resorts = [
      makeResort({ id: "r1", condition: { ...makeResort().condition, windSpeedKmh: 50 } }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ maxWindSpeedKmh: 50 })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — hideFreezeThawRisk", () => {
  it("excludes resorts with freeze-thaw risk when flag is true", () => {
    const resorts = [
      makeResort({
        id: "r1",
        condition: { ...makeResort().condition, freezeThawRisk: true },
      }),
      makeResort({
        id: "r2",
        condition: { ...makeResort().condition, freezeThawRisk: false },
      }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hideFreezeThawRisk: true })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("keeps freeze-thaw resorts when flag is false", () => {
    const resorts = [
      makeResort({
        id: "r1",
        condition: { ...makeResort().condition, freezeThawRisk: true },
      }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hideFreezeThawRisk: false })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — countries", () => {
  it("keeps only resorts in the specified countries", () => {
    const resorts = [
      makeResort({ id: "r1", country: "CA" }),
      makeResort({ id: "r2", country: "US" }),
      makeResort({ id: "r3", country: "FR" }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ countries: ["CA", "FR"] })),
    );
    expect(result.current).toHaveLength(2);
    expect(result.current.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("passes all through when countries is empty", () => {
    const resorts = [
      makeResort({ id: "r1", country: "CA" }),
      makeResort({ id: "r2", country: "US" }),
    ];
    const { result } = renderHook(() => useFilteredResorts(resorts, withFilter({ countries: [] })));
    expect(result.current).toHaveLength(2);
  });

  it("excludes resorts with null country when a country filter is set", () => {
    const resorts = [
      makeResort({ id: "r1", country: null }),
      makeResort({ id: "r2", country: "CA" }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ countries: ["CA"] })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });
});

describe("useFilteredResorts — elevationMin / elevationMax", () => {
  it("excludes resort whose maxElevation is below elevationMin", () => {
    const resorts = [
      makeResort({ id: "r1", maxElevation: 800 }),
      makeResort({ id: "r2", maxElevation: 2000 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ elevationMin: 1000 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("excludes resort whose maxElevation is above elevationMax", () => {
    const resorts = [
      makeResort({ id: "r1", maxElevation: 4000 }),
      makeResort({ id: "r2", maxElevation: 2000 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ elevationMax: 3000 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("passes resort with null maxElevation when elevationMin is 0 (default)", () => {
    const resorts = [makeResort({ id: "r1", maxElevation: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ elevationMin: 0, elevationMax: 5000 })),
    );
    expect(result.current).toHaveLength(1);
  });

  it("excludes resort with null maxElevation when elevationMin is set above 0", () => {
    const resorts = [makeResort({ id: "r1", maxElevation: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ elevationMin: 500 })),
    );
    expect(result.current).toHaveLength(0);
  });
});

describe("useFilteredResorts — verticalDropMin", () => {
  it("excludes resort below vertical minimum", () => {
    const resorts = [
      makeResort({ id: "r1", vertical: 200 }),
      makeResort({ id: "r2", vertical: 800 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ verticalDropMin: 500 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("passes all through when verticalDropMin is 0", () => {
    const resorts = [makeResort({ id: "r1", vertical: 0 })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ verticalDropMin: 0 })),
    );
    expect(result.current).toHaveLength(1);
  });

  it("excludes resort with null vertical when verticalDropMin is above 0", () => {
    const resorts = [makeResort({ id: "r1", vertical: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ verticalDropMin: 100 })),
    );
    expect(result.current).toHaveLength(0);
  });

  it("passes resort with null vertical when verticalDropMin is 0", () => {
    const resorts = [makeResort({ id: "r1", vertical: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ verticalDropMin: 0 })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — totalRunLengthMinKm", () => {
  it("excludes resort below the minimum run length", () => {
    const resorts = [
      makeResort({ id: "r1", totalRunLengthKm: 20 }),
      makeResort({ id: "r2", totalRunLengthKm: 100 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ totalRunLengthMinKm: 50 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("excludes resort with null totalRunLengthKm when min is above 0", () => {
    const resorts = [makeResort({ id: "r1", totalRunLengthKm: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ totalRunLengthMinKm: 10 })),
    );
    expect(result.current).toHaveLength(0);
  });

  it("passes resort with null totalRunLengthKm when min is 0", () => {
    const resorts = [makeResort({ id: "r1", totalRunLengthKm: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ totalRunLengthMinKm: 0 })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — liftCountMin", () => {
  it("excludes resort below minimum lift count", () => {
    const resorts = [
      makeResort({ id: "r1", liftCount: 3 }),
      makeResort({ id: "r2", liftCount: 15 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ liftCountMin: 10 })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("excludes resort with null liftCount when min is above 0", () => {
    const resorts = [makeResort({ id: "r1", liftCount: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ liftCountMin: 1 })),
    );
    expect(result.current).toHaveLength(0);
  });

  it("passes resort with null liftCount when min is 0", () => {
    const resorts = [makeResort({ id: "r1", liftCount: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ liftCountMin: 0 })),
    );
    expect(result.current).toHaveLength(1);
  });
});

describe("useFilteredResorts — terrain flags", () => {
  it("excludes resort with null easyRuns when hasEasyRuns is true", () => {
    const resorts = [makeResort({ id: "r1", easyRuns: null })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasEasyRuns: true })),
    );
    expect(result.current).toHaveLength(0);
  });

  it("excludes resort with 0 easyRuns when hasEasyRuns is true", () => {
    const resorts = [makeResort({ id: "r1", easyRuns: 0 })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasEasyRuns: true })),
    );
    expect(result.current).toHaveLength(0);
  });

  it("keeps resort with >0 easyRuns when hasEasyRuns is true", () => {
    const resorts = [makeResort({ id: "r1", easyRuns: 5 })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasEasyRuns: true })),
    );
    expect(result.current).toHaveLength(1);
  });

  it("keeps resort with 0 easyRuns when hasEasyRuns is false", () => {
    const resorts = [makeResort({ id: "r1", easyRuns: 0 })];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasEasyRuns: false })),
    );
    expect(result.current).toHaveLength(1);
  });

  it("filters intermediateRuns correctly", () => {
    const resorts = [
      makeResort({ id: "r1", intermediateRuns: 0 }),
      makeResort({ id: "r2", intermediateRuns: 10 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasIntermediateRuns: true })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("filters advancedRuns correctly", () => {
    const resorts = [
      makeResort({ id: "r1", advancedRuns: null }),
      makeResort({ id: "r2", advancedRuns: 8 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasAdvancedRuns: true })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });

  it("filters expertRuns correctly", () => {
    const resorts = [
      makeResort({ id: "r1", expertRuns: 0 }),
      makeResort({ id: "r2", expertRuns: 3 }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(resorts, withFilter({ hasExpertRuns: true })),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r2");
  });
});

describe("useFilteredResorts — combined filters", () => {
  it("applies multiple filters conjunctively", () => {
    const resorts = [
      makeResort({
        id: "r1",
        country: "CA",
        condition: {
          score: "EXCELLENT",
          temperature: -5,
          freshSnowCm: 40,
          snowBaseCm: 200,
          windSpeedKmh: 20,
          freezeThawRisk: false,
        },
      }),
      makeResort({
        id: "r2",
        country: "US",
        condition: {
          score: "EXCELLENT",
          temperature: -5,
          freshSnowCm: 40,
          snowBaseCm: 200,
          windSpeedKmh: 20,
          freezeThawRisk: false,
        },
      }),
      makeResort({
        id: "r3",
        country: "CA",
        condition: {
          score: "POOR",
          temperature: -5,
          freshSnowCm: 40,
          snowBaseCm: 200,
          windSpeedKmh: 20,
          freezeThawRisk: false,
        },
      }),
    ];
    const { result } = renderHook(() =>
      useFilteredResorts(
        resorts,
        withFilter({ countries: ["CA"], conditionScores: ["EXCELLENT"] }),
      ),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.id).toBe("r1");
  });
});
