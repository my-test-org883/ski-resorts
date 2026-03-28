import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGeolocation } from "./useGeolocation";

const mockGetCurrentPosition = vi.fn();

const mockGeolocation = {
  getCurrentPosition: mockGetCurrentPosition,
};

beforeEach(() => {
  mockGetCurrentPosition.mockReset();
  Object.defineProperty(navigator, "geolocation", {
    value: mockGeolocation,
    writable: true,
    configurable: true,
  });
});

describe("useGeolocation", () => {
  it("returns initial state with loading=true and null values", () => {
    mockGetCurrentPosition.mockImplementation(() => {
      // never calls back — stays in loading state
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current).toEqual({
      lat: null,
      lng: null,
      loading: true,
      error: null,
    });
  });

  it("returns lat/lng with loading=false on successful geolocation", () => {
    mockGetCurrentPosition.mockImplementation((successCallback) => {
      successCallback({
        coords: { latitude: 45.5231, longitude: -122.6765 },
      });
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current).toEqual({
      lat: 45.5231,
      lng: -122.6765,
      loading: false,
      error: null,
    });
  });

  it("returns error message with loading=false on geolocation failure", () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCallback) => {
      errorCallback({ message: "User denied geolocation" });
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current).toEqual({
      lat: null,
      lng: null,
      loading: false,
      error: "User denied geolocation",
    });
  });

  it("returns not-supported error when navigator.geolocation is undefined", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {});

    expect(result.current).toEqual({
      lat: null,
      lng: null,
      loading: false,
      error: "Geolocation is not supported by your browser",
    });
  });
});
