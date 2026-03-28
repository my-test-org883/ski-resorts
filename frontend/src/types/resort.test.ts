import { describe, it, expect } from "vitest";
import { SCORE_COLORS, SCORE_LABELS } from "./resort";
import type { ConditionScore } from "./resort";

const ALL_SCORES: ConditionScore[] = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

describe("SCORE_COLORS", () => {
  it("has exactly 4 entries", () => {
    expect(Object.keys(SCORE_COLORS)).toHaveLength(4);
  });

  it.each<[ConditionScore, string]>([
    ["EXCELLENT", "#22c55e"],
    ["GOOD", "#eab308"],
    ["FAIR", "#f59e0b"],
    ["POOR", "#ef4444"],
  ])("maps %s to hex color %s", (score, hex) => {
    expect(SCORE_COLORS[score]).toBe(hex);
  });

  it("has entries for all 4 condition scores", () => {
    for (const score of ALL_SCORES) {
      expect(SCORE_COLORS).toHaveProperty(score);
    }
  });
});

describe("SCORE_LABELS", () => {
  it("has exactly 4 entries", () => {
    expect(Object.keys(SCORE_LABELS)).toHaveLength(4);
  });

  it.each<[ConditionScore, string]>([
    ["EXCELLENT", "Excellent"],
    ["GOOD", "Good"],
    ["FAIR", "Fair"],
    ["POOR", "Poor"],
  ])("maps %s to label %s", (score, label) => {
    expect(SCORE_LABELS[score]).toBe(label);
  });

  it("has entries for all 4 condition scores", () => {
    for (const score of ALL_SCORES) {
      expect(SCORE_LABELS).toHaveProperty(score);
    }
  });
});
