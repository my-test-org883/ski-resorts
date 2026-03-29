import { useMemo } from "react";
import type { Resort } from "../types/resort";
import { DEFAULT_FILTER_STATE } from "../types/filters";
import type { FilterState } from "../types/filters";

function applyFilters(resorts: Resort[], filters: FilterState): Resort[] {
  return resorts.filter((resort) => {
    const { condition } = resort;

    // Condition scores
    if (filters.conditionScores.length > 0 && !filters.conditionScores.includes(condition.score)) {
      return false;
    }

    // Fresh snow minimum
    if (condition.freshSnowCm < filters.freshSnowMinCm) {
      return false;
    }

    // Temperature range
    if (
      condition.temperature < filters.temperatureMin ||
      condition.temperature > filters.temperatureMax
    ) {
      return false;
    }

    // Max wind speed
    if (condition.windSpeedKmh > filters.maxWindSpeedKmh) {
      return false;
    }

    // Hide freeze-thaw risk
    if (filters.hideFreezeThawRisk && condition.freezeThawRisk) {
      return false;
    }

    // Countries
    if (filters.countries.length > 0) {
      if (resort.country === null || !filters.countries.includes(resort.country)) {
        return false;
      }
    }

    // Elevation range (uses maxElevation)
    if (filters.elevationMin > 0) {
      if (resort.maxElevation === null || resort.maxElevation < filters.elevationMin) {
        return false;
      }
    }
    if (filters.elevationMax < DEFAULT_FILTER_STATE.elevationMax) {
      if (resort.maxElevation !== null && resort.maxElevation > filters.elevationMax) {
        return false;
      }
    }

    // Vertical drop minimum
    if (filters.verticalDropMin > 0) {
      if (resort.vertical === null || resort.vertical < filters.verticalDropMin) {
        return false;
      }
    }

    // Total run length minimum
    if (filters.totalRunLengthMinKm > 0) {
      if (
        resort.totalRunLengthKm === null ||
        resort.totalRunLengthKm < filters.totalRunLengthMinKm
      ) {
        return false;
      }
    }

    // Lift count minimum
    if (filters.liftCountMin > 0) {
      if (resort.liftCount === null || resort.liftCount < filters.liftCountMin) {
        return false;
      }
    }

    // Terrain flags
    if (filters.hasEasyRuns && !(resort.easyRuns !== null && resort.easyRuns > 0)) {
      return false;
    }
    if (
      filters.hasIntermediateRuns &&
      !(resort.intermediateRuns !== null && resort.intermediateRuns > 0)
    ) {
      return false;
    }
    if (filters.hasAdvancedRuns && !(resort.advancedRuns !== null && resort.advancedRuns > 0)) {
      return false;
    }
    if (filters.hasExpertRuns && !(resort.expertRuns !== null && resort.expertRuns > 0)) {
      return false;
    }

    return true;
  });
}

export function useFilteredResorts(resorts: Resort[], filters: FilterState): Resort[] {
  return useMemo(() => applyFilters(resorts, filters), [resorts, filters]);
}
