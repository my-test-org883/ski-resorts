import type { Resort } from "../types/resort";
import { SCORE_COLORS, SCORE_LABELS } from "../types/resort";

export function renderPopupHTML(resort: Resort): string {
  const color = SCORE_COLORS[resort.condition.score];
  const label = SCORE_LABELS[resort.condition.score];

  return `
    <div style="font-family: Inter, -apple-system, sans-serif; padding: 4px; min-width: 200px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="font-size: 15px; color: #1e293b;">${resort.name}</strong>
        <span style="background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
          ${label}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; color: #64748b;">
        <span>❄ Fresh: ${parseFloat(resort.condition.freshSnowCm.toFixed(1))}cm</span>
        <span>🏔 Base: ${parseFloat(resort.condition.snowBaseCm.toFixed(1))}cm</span>
        <span>🌡 Temp: ${parseFloat(resort.condition.temperature.toFixed(1))}°C</span>
        <span>💨 Wind: ${parseFloat(resort.condition.windSpeedKmh.toFixed(1))} km/h</span>
        <span>📏 Distance: ${Math.round(resort.distanceKm)} km</span>
        <span>⬆ Elev: ${resort.elevation}m</span>
      </div>
      ${resort.condition.freezeThawRisk ? '<div style="margin-top: 8px; font-size: 11px; color: #f59e0b;">⚠ Freeze-thaw risk — possible icy conditions</div>' : ""}
    </div>
  `;
}
