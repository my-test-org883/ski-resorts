import { useState, useEffect, useRef } from "react";
import type { CityOverride } from "../types/city";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface GeocodingFeature {
  properties: {
    name: string;
    context: {
      country: { name: string };
    };
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GeocodingResponse {
  features: GeocodingFeature[];
}

interface CitySearchProps {
  selectedCity: CityOverride | null;
  onSelect: (city: CityOverride) => void;
  onClear: () => void;
  mapboxToken: string;
}

export function CitySearch({ selectedCity, onSelect, onClear, mapboxToken }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CityOverride[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(debouncedQuery)}&types=place&limit=5&access_token=${mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data: GeocodingResponse) => {
        const cities: CityOverride[] = data.features.map((f) => ({
          name: f.properties.name,
          country: f.properties.context.country.name,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }));
        setSuggestions(cities);
        setOpen(cities.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setOpen(false);
      });
  }, [debouncedQuery, mapboxToken]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSuggestionMouseDown(city: CityOverride) {
    onSelect(city);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  }

  if (selectedCity !== null) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-sm)",
          padding: "6px 10px",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
          {selectedCity.name}, {selectedCity.country}
        </span>
        <button
          aria-label="Clear city"
          onClick={onClear}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
            padding: "0 2px",
            fontSize: "14px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          background: "var(--bg-tertiary)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "7px 12px",
          fontSize: "13px",
          color: "var(--text-primary)",
          outline: "none",
          width: "180px",
        }}
      />
      {open && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: "200px",
            zIndex: 100,
          }}
        >
          {suggestions.map((city) => (
            <li
              key={`${city.name}-${city.country}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionMouseDown(city);
              }}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              {city.name}, {city.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
