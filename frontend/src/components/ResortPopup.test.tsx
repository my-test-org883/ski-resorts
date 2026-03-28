import { describe, it, expect } from "vitest";
import type { Resort } from "../types/resort";
import { renderPopupHTML } from "./ResortPopup";

function makeResort(overrides: Partial<Resort> = {}): Resort {
  return {
    id: "resort-1",
    name: "Alpine Peak",
    lat: 45.0,
    lng: -75.0,
    distanceKm: 12.5,
    elevation: 1800,
    condition: {
      score: "EXCELLENT",
      temperature: -5,
      freshSnowCm: 30,
      snowBaseCm: 200,
      windSpeedKmh: 10,
      freezeThawRisk: false,
    },
    ...overrides,
  };
}

describe("renderPopupHTML", () => {
  it("renders the resort name", () => {
    const html = renderPopupHTML(makeResort({ name: "Ridgeline Bowl" }));
    expect(html).toContain("Ridgeline Bowl");
  });

  it.each<[Resort["condition"]["score"], string, string]>([
    ["EXCELLENT", "Excellent", "#22c55e"],
    ["GOOD", "Good", "#eab308"],
    ["FAIR", "Fair", "#f59e0b"],
    ["POOR", "Poor", "#ef4444"],
  ])("renders score %s with label %s and color %s", (score, label, color) => {
    const html = renderPopupHTML(makeResort({ condition: { ...makeResort().condition, score } }));
    expect(html).toContain(label);
    expect(html).toContain(color);
  });

  it("renders freshSnowCm metric", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, freshSnowCm: 42 },
      }),
    );
    expect(html).toContain("42");
  });

  it("renders snowBaseCm metric", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, snowBaseCm: 175 },
      }),
    );
    expect(html).toContain("175");
  });

  it("renders temperature metric", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, temperature: -12 },
      }),
    );
    expect(html).toContain("-12");
  });

  it("renders windSpeedKmh metric", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, windSpeedKmh: 35 },
      }),
    );
    expect(html).toContain("35");
  });

  it("renders distanceKm metric", () => {
    const html = renderPopupHTML(makeResort({ distanceKm: 27.3 }));
    expect(html).toContain("27.3");
  });

  it("renders elevation metric", () => {
    const html = renderPopupHTML(makeResort({ elevation: 2400 }));
    expect(html).toContain("2400");
  });

  it("shows freeze-thaw warning when freezeThawRisk is true", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, freezeThawRisk: true },
      }),
    );
    expect(html).toContain("Freeze-thaw risk");
  });

  it("does NOT show freeze-thaw warning when freezeThawRisk is false", () => {
    const html = renderPopupHTML(
      makeResort({
        condition: { ...makeResort().condition, freezeThawRisk: false },
      }),
    );
    expect(html).not.toContain("Freeze-thaw risk");
  });
});
