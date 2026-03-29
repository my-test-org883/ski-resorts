import { useState, useCallback } from "react";
import { Provider } from "urql";
import { graphqlClient } from "./lib/graphql";
import { useGeolocation } from "./hooks/useGeolocation";
import { useResorts } from "./hooks/useResorts";
import { Map } from "./components/Map";
import { ResortCardCarousel } from "./components/ResortCardCarousel";
import { RadiusControl } from "./components/RadiusControl";
import { CitySearch } from "./components/CitySearch";
import { MapControls } from "./components/MapControls";
import { LoadingScreen } from "./components/LoadingScreen";
import type { Resort } from "./types/resort";
import type { CityOverride } from "./types/city";
import "./styles/globals.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

function AppContent() {
  const geo = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [cityOverride, setCityOverride] = useState<CityOverride | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);

  const effectiveLat = cityOverride?.lat ?? geo.lat;
  const effectiveLng = cityOverride?.lng ?? geo.lng;

  const {
    resorts,
    loading: resortsLoading,
    error: resortsError,
  } = useResorts(effectiveLat, effectiveLng, radiusKm);

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

  const handleCitySelect = useCallback((city: CityOverride) => {
    setCityOverride(city);
    setFlyToCoords({ lat: city.lat, lng: city.lng });
    setSelectedId(null);
    setFlyToId(null);
  }, []);

  const handleCityClear = useCallback(() => {
    setCityOverride(null);
    if (geo.lat && geo.lng) {
      setFlyToCoords({ lat: geo.lat, lng: geo.lng });
    }
    setSelectedId(null);
    setFlyToId(null);
  }, [geo.lat, geo.lng]);

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
          resorts={resorts}
          userLat={geo.lat}
          userLng={geo.lng}
          selectedId={selectedId}
          flyToId={flyToId}
          onFlyToDone={() => setFlyToId(null)}
          onSelectResort={handleSelectFromMap}
          accessToken={MAPBOX_TOKEN}
          flyToCoords={flyToCoords}
          onFlyToCoordsDone={() => setFlyToCoords(null)}
          showUserMarker={cityOverride === null}
        />
        <MapControls>
          <CitySearch
            selectedCity={cityOverride}
            onSelect={handleCitySelect}
            onClear={handleCityClear}
            mapboxToken={MAPBOX_TOKEN}
          />
          <RadiusControl radiusKm={radiusKm} onChange={handleRadiusChange} />
        </MapControls>
      </div>
      <ResortCardCarousel
        resorts={resorts}
        selectedId={selectedId}
        onSelect={handleSelectFromCarousel}
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
