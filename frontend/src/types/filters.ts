import type { ConditionScore } from "./resort";

export type { ConditionScore };

export interface FilterState {
  // Conditions
  conditionScores: ConditionScore[];
  freshSnowMinCm: number;
  temperatureMin: number;
  temperatureMax: number;
  maxWindSpeedKmh: number;
  hideFreezeThawRisk: boolean;

  // Resort
  countries: string[];
  elevationMin: number;
  elevationMax: number;
  verticalDropMin: number;
  totalRunLengthMinKm: number;
  liftCountMin: number;

  // Terrain
  hasEasyRuns: boolean;
  hasIntermediateRuns: boolean;
  hasAdvancedRuns: boolean;
  hasExpertRuns: boolean;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  conditionScores: [],
  freshSnowMinCm: 0,
  temperatureMin: -40,
  temperatureMax: 10,
  maxWindSpeedKmh: 120,
  hideFreezeThawRisk: false,

  countries: [],
  elevationMin: 0,
  elevationMax: 5000,
  verticalDropMin: 0,
  totalRunLengthMinKm: 0,
  liftCountMin: 0,

  hasEasyRuns: false,
  hasIntermediateRuns: false,
  hasAdvancedRuns: false,
  hasExpertRuns: false,
};
