import { useCallback, useMemo, useState } from "react";
import { DEFAULT_FILTER_STATE } from "../types/filters";
import type { FilterState } from "../types/filters";

function computeActiveFilterCount(filters: FilterState): number {
  const d = DEFAULT_FILTER_STATE;
  let count = 0;

  if (filters.conditionScores.length > 0) count++;
  if (filters.freshSnowMinCm !== d.freshSnowMinCm) count++;
  if (filters.temperatureMin !== d.temperatureMin) count++;
  if (filters.temperatureMax !== d.temperatureMax) count++;
  if (filters.maxWindSpeedKmh !== d.maxWindSpeedKmh) count++;
  if (filters.hideFreezeThawRisk !== d.hideFreezeThawRisk) count++;

  if (filters.countries.length > 0) count++;
  if (filters.elevationMin !== d.elevationMin) count++;
  if (filters.elevationMax !== d.elevationMax) count++;
  if (filters.verticalDropMin !== d.verticalDropMin) count++;
  if (filters.totalRunLengthMinKm !== d.totalRunLengthMinKm) count++;
  if (filters.liftCountMin !== d.liftCountMin) count++;

  if (filters.hasEasyRuns !== d.hasEasyRuns) count++;
  if (filters.hasIntermediateRuns !== d.hasIntermediateRuns) count++;
  if (filters.hasAdvancedRuns !== d.hasAdvancedRuns) count++;
  if (filters.hasExpertRuns !== d.hasExpertRuns) count++;

  return count;
}

interface UseFiltersResult {
  filters: FilterState;
  activeFilterCount: number;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

export function useFilters(): UseFiltersResult {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  const activeFilterCount = useMemo(() => computeActiveFilterCount(filters), [filters]);

  return {
    filters,
    activeFilterCount,
    updateFilter,
    resetFilters,
  };
}
