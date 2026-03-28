export type ConditionScore = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface Condition {
  score: ConditionScore;
  temperature: number;
  freshSnowCm: number;
  snowBaseCm: number;
  windSpeedKmh: number;
  freezeThawRisk: boolean;
}

export interface Resort {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  elevation: number;
  condition: Condition;
}

export const SCORE_COLORS: Record<ConditionScore, string> = {
  EXCELLENT: "#22c55e",
  GOOD: "#eab308",
  FAIR: "#f59e0b",
  POOR: "#ef4444",
};

export const SCORE_LABELS: Record<ConditionScore, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};
