import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { Resort } from "../types/resort";
import { SCORE_COLORS } from "../types/resort";
import { renderPopupHTML } from "./ResortPopup";

interface MapProps {
  resorts: Resort[];
  userLat: number;
  userLng: number;
  selectedId: string | null;
  onSelectResort: (resort: Resort) => void;
  accessToken: string;
}

export function Map({
  resorts,
  userLat,
  userLng,
  selectedId,
  onSelectResort,
  accessToken,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [userLng, userLat],
      zoom: 7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const userEl = document.createElement("div");
    userEl.style.cssText = `
      width: 16px; height: 16px;
      background: var(--accent-blue, #3b82f6);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
    `;
    new mapboxgl.Marker({ element: userEl }).setLngLat([userLng, userLat]).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng, accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    resorts.forEach((resort) => {
      const color = SCORE_COLORS[resort.condition.score];

      const el = document.createElement("div");
      el.style.cssText = `
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid ${color}44;
        border-radius: 50%;
        box-shadow: 0 0 8px ${color}88;
        cursor: pointer;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([resort.lng, resort.lat])
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectResort(resort);
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 12, maxWidth: "280px", closeOnClick: false })
          .setLngLat([resort.lng, resort.lat])
          .setHTML(renderPopupHTML(resort))
          .addTo(map);
      });

      markersRef.current.push(marker);
    });
  }, [resorts, onSelectResort]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const resort = resorts.find((r) => r.id === selectedId);
    if (!resort) return;

    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({ offset: 12, maxWidth: "280px", closeOnClick: false })
      .setLngLat([resort.lng, resort.lat])
      .setHTML(renderPopupHTML(resort))
      .addTo(mapRef.current);
  }, [selectedId, resorts]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
