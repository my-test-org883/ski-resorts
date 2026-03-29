import { useState, useCallback, useMemo, useEffect } from "react";
import { Provider } from "urql";
import { graphqlClient } from "./lib/graphql";
import { useGeolocation } from "./hooks/useGeolocation";
import { useResorts } from "./hooks/useResorts";
import { useFilters } from "./hooks/useFilters";
import { useFilteredResorts } from "./hooks/useFilteredResorts";
import { Map } from "./components/Map";
import { ResortCardCarousel } from "./components/ResortCardCarousel";
import { RadiusControl } from "./components/RadiusControl";
import { LoadingScreen } from "./components/LoadingScreen";
import { FilterToggleButton } from "./components/FilterToggleButton";
import { FilterPanel } from "./components/FilterPanel";
import type { Resort } from "./types/resort";
import "./styles/globals.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

function AppContent() {
  const geo = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const {
    resorts,
    loading: resortsLoading,
    error: resortsError,
  } = useResorts(geo.lat, geo.lng, radiusKm);

  const { filters, activeFilterCount, updateFilter, resetFilters } = useFilters();
  const filteredResorts = useFilteredResorts(resorts, filters);

  const countryOptions = useMemo(() => {
    const countries = resorts.flatMap((r) => (r.country !== null ? [r.country] : []));
    return [...new Set(countries)].sort();
  }, [resorts]);

  // Clear selection when filtered resort disappears
  useEffect(() => {
    if (selectedId && !filteredResorts.some((r) => r.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, filteredResorts]);

  const handleSelectFromMap = useCallback((resort: Resort) => {
    setSelectedId(resort.id);
  }, []);

  const handleSelectFromCarousel = useCallback((resort: Resort) => {
    setSelectedId(resort.id);
    setFlyToId(resort.id);
  }, []);

  const handleRadiusChange = useCallback((radius: number) => {
    setRadiusKm(radius);
    setSelectedId(null);
    setFlyToId(null);
  }, []);

  if (geo.loading) {
    return <LoadingScreen message="Requesting your location..." />;
  }

  if (geo.error || !geo.lat || !geo.lng) {
    return (
      <LoadingScreen
        message=""
        error={
          geo.error ||
          "Could not determine your location. Please allow location access and try again."
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (resortsLoading && resorts.length === 0) {
    return <LoadingScreen message="Finding nearby ski resorts..." />;
  }

  if (resortsError && resorts.length === 0) {
    return (
      <LoadingScreen
        message=""
        error={`Failed to load resorts: ${resortsError}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Map
          resorts={filteredResorts}
          userLat={geo.lat}
          userLng={geo.lng}
          selectedId={selectedId}
          flyToId={flyToId}
          onFlyToDone={() => setFlyToId(null)}
          onSelectResort={handleSelectFromMap}
          accessToken={MAPBOX_TOKEN}
        />

        {/* Map controls — top-left stack */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <FilterToggleButton
            activeFilterCount={activeFilterCount}
            onClick={() => setFilterPanelOpen((prev) => !prev)}
          />
          <RadiusControl radiusKm={radiusKm} onChange={handleRadiusChange} />
        </div>

        {/* Filter panel — always rendered for slide animation */}
        <FilterPanel
          isOpen={filterPanelOpen}
          filters={filters}
          onUpdateFilter={updateFilter}
          onReset={resetFilters}
          onClose={() => setFilterPanelOpen(false)}
          activeFilterCount={activeFilterCount}
          countryOptions={countryOptions}
        />
      </div>
      <ResortCardCarousel
        resorts={filteredResorts}
        selectedId={selectedId}
        onSelect={handleSelectFromCarousel}
        hasActiveFilters={activeFilterCount > 0}
        onResetFilters={resetFilters}
      />
    </div>
  );
}

export default function App() {
  return (
    <Provider value={graphqlClient}>
      <AppContent />
    </Provider>
  );
}
