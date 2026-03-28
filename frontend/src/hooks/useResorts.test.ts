import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useQuery } from "urql";
import { useResorts } from "./useResorts";
import type { Resort } from "../types/resort";

vi.mock("urql", async (importOriginal) => {
  const actual = await importOriginal<typeof import("urql")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const mockUseQuery = vi.mocked(useQuery);

const mockResort: Resort = {
  id: "1",
  name: "Mt. Hood Meadows",
  lat: 45.33,
  lng: -121.66,
  distanceKm: 12.5,
  elevation: 2240,
  condition: {
    score: "GOOD",
    temperature: -3,
    freshSnowCm: 15,
    snowBaseCm: 120,
    windSpeedKmh: 25,
    freezeThawRisk: false,
  },
};

describe("useResorts", () => {
  it("returns empty resorts with loading=false when lat/lng are null", () => {
    mockUseQuery.mockReturnValue([
      { data: undefined, fetching: false, error: undefined },
      vi.fn(),
    ] as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useResorts(null, null, 50));

    expect(result.current).toEqual({
      resorts: [],
      loading: false,
      error: null,
    });

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ pause: true }));
  });

  it("passes pause=false when both lat and lng are provided", () => {
    mockUseQuery.mockReturnValue([
      { data: { nearbyResorts: [mockResort] }, fetching: false, error: undefined },
      vi.fn(),
    ] as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useResorts(45.33, -121.66, 50));

    expect(result.current).toEqual({
      resorts: [mockResort],
      loading: false,
      error: null,
    });

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ pause: false }));
  });

  it("returns error message when query errors", () => {
    mockUseQuery.mockReturnValue([
      {
        data: undefined,
        fetching: false,
        error: { message: "Network error" } as ReturnType<typeof useQuery>[0]["error"],
      },
      vi.fn(),
    ] as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useResorts(45.33, -121.66, 50));

    expect(result.current).toEqual({
      resorts: [],
      loading: false,
      error: "Network error",
    });
  });

  it("returns loading=true while query is fetching", () => {
    mockUseQuery.mockReturnValue([
      { data: undefined, fetching: true, error: undefined },
      vi.fn(),
    ] as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useResorts(45.33, -121.66, 50));

    expect(result.current).toEqual({
      resorts: [],
      loading: true,
      error: null,
    });
  });
});
