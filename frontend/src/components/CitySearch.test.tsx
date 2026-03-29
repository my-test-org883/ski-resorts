import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CityOverride } from "../types/city";
import { CitySearch } from "./CitySearch";

const mockToken = "pk.test-token";

const mockGeocodingResponse = {
  features: [
    {
      properties: {
        name: "Whistler",
        context: {
          country: { name: "Canada" },
        },
      },
      geometry: {
        coordinates: [-122.9574, 50.1163],
      },
    },
    {
      properties: {
        name: "Chamonix",
        context: {
          country: { name: "France" },
        },
      },
      geometry: {
        coordinates: [6.8696, 45.9237],
      },
    },
  ],
};

function makeCity(overrides: Partial<CityOverride> = {}): CityOverride {
  return {
    name: "Whistler",
    country: "Canada",
    lat: 50.1163,
    lng: -122.9574,
    ...overrides,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CitySearch", () => {
  describe("no city selected mode", () => {
    it("renders a search input with placeholder 'Search city...'", () => {
      render(
        <CitySearch
          selectedCity={null}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );
      expect(screen.getByPlaceholderText("Search city...")).toBeInTheDocument();
    });

    it("does not fetch for input shorter than 2 characters", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");
      render(
        <CitySearch
          selectedCity={null}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("Search city..."), {
        target: { value: "W" },
      });

      await waitFor(() => {}, { timeout: 400 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches geocoding results after typing 2+ characters", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      render(
        <CitySearch
          selectedCity={null}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("Search city..."), {
        target: { value: "Wh" },
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("api.mapbox.com"));
      });
    });

    it("shows suggestions in a dropdown after typing", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      render(
        <CitySearch
          selectedCity={null}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("Search city..."), {
        target: { value: "Wh" },
      });

      await waitFor(() => {
        expect(screen.getByText("Whistler, Canada")).toBeInTheDocument();
        expect(screen.getByText("Chamonix, France")).toBeInTheDocument();
      });
    });

    it("calls onSelect with correct city data when a suggestion is clicked", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      const onSelect = vi.fn();
      render(
        <CitySearch
          selectedCity={null}
          onSelect={onSelect}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("Search city..."), {
        target: { value: "Wh" },
      });

      await waitFor(() => {
        expect(screen.getByText("Whistler, Canada")).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText("Whistler, Canada"));

      expect(onSelect).toHaveBeenCalledWith({
        name: "Whistler",
        country: "Canada",
        lat: 50.1163,
        lng: -122.9574,
      });
    });

    it("closes the dropdown on Escape key", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      render(
        <CitySearch
          selectedCity={null}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("Search city..."), {
        target: { value: "Wh" },
      });

      await waitFor(() => {
        expect(screen.getByText("Whistler, Canada")).toBeInTheDocument();
      });

      fireEvent.keyDown(screen.getByPlaceholderText("Search city..."), {
        key: "Escape",
      });

      expect(screen.queryByText("Whistler, Canada")).not.toBeInTheDocument();
    });
  });

  describe("city selected mode", () => {
    it("renders a tag showing 'City, Country' when a city is selected", () => {
      render(
        <CitySearch
          selectedCity={makeCity()}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      expect(screen.getByText("Whistler, Canada")).toBeInTheDocument();
    });

    it("does not render the search input when a city is selected", () => {
      render(
        <CitySearch
          selectedCity={makeCity()}
          onSelect={vi.fn()}
          onClear={vi.fn()}
          mapboxToken={mockToken}
        />,
      );

      expect(screen.queryByPlaceholderText("Search city...")).not.toBeInTheDocument();
    });

    it("calls onClear when the X button is clicked", () => {
      const onClear = vi.fn();
      render(
        <CitySearch
          selectedCity={makeCity()}
          onSelect={vi.fn()}
          onClear={onClear}
          mapboxToken={mockToken}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /clear/i }));
      expect(onClear).toHaveBeenCalledOnce();
    });
  });
});
