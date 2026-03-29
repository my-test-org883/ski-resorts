import { useEffect, useRef } from "react";
import type { FilterState } from "../types/filters";
import { FilterSection } from "./filters/FilterSection";
import { ConditionChips } from "./filters/ConditionChips";
import { RangeSlider } from "./filters/RangeSlider";
import { DualRangeSlider } from "./filters/DualRangeSlider";
import { Toggle } from "./filters/Toggle";
import { MultiSelectDropdown } from "./filters/MultiSelectDropdown";

interface FilterPanelProps {
  isOpen: boolean;
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  onClose: () => void;
  activeFilterCount: number;
  countryOptions: string[];
}

export function FilterPanel({
  isOpen,
  filters,
  onUpdateFilter,
  onReset,
  onClose,
  activeFilterCount,
  countryOptions,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="filter-backdrop"
        role="presentation"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 19,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      <aside
        ref={panelRef}
        role="complementary"
        aria-hidden={!isOpen}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "320px",
          height: "100%",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--bg-tertiary)",
          boxShadow: isOpen ? "4px 0 24px rgba(0, 0, 0, 0.4)" : "none",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 16px",
            borderBottom: "1px solid var(--bg-tertiary)",
            flexShrink: 0,
          }}
        >
          <span
            style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", flex: 1 }}
          >
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span
              data-testid="active-count-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "20px",
                height: "20px",
                padding: "0 6px",
                background: "var(--accent-blue)",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {activeFilterCount}
            </span>
          )}
          <button
            aria-label="Reset filters"
            onClick={onReset}
            style={{
              background: activeFilterCount > 0 ? "rgba(59, 130, 246, 0.1)" : "none",
              border: "none",
              color: activeFilterCount > 0 ? "var(--accent-blue)" : "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            Reset
          </button>
          <button
            aria-label="Close filters"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm)",
              transition: "background 0.15s",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="filter-panel-content"
          style={{
            padding: "4px 16px 16px",
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Conditions */}
          <FilterSection title="Conditions" defaultOpen>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                paddingBottom: "8px",
              }}
            >
              <ConditionChips
                selected={filters.conditionScores}
                onChange={(scores) => onUpdateFilter("conditionScores", scores)}
              />
              <RangeSlider
                label="Fresh snow"
                min={0}
                max={100}
                value={filters.freshSnowMinCm}
                onChange={(v) => onUpdateFilter("freshSnowMinCm", v)}
                unit="cm"
              />
              <DualRangeSlider
                label="Temperature"
                min={-40}
                max={15}
                valueLow={filters.temperatureMin}
                valueHigh={filters.temperatureMax}
                onChangeLow={(v) => onUpdateFilter("temperatureMin", v)}
                onChangeHigh={(v) => onUpdateFilter("temperatureMax", v)}
                unit="°C"
              />
              <RangeSlider
                label="Max wind"
                min={0}
                max={120}
                value={filters.maxWindSpeedKmh}
                onChange={(v) => onUpdateFilter("maxWindSpeedKmh", v)}
                unit="km/h"
              />
              <Toggle
                label="Hide freeze-thaw risk"
                checked={filters.hideFreezeThawRisk}
                onChange={(v) => onUpdateFilter("hideFreezeThawRisk", v)}
              />
            </div>
          </FilterSection>

          {/* Resort */}
          <FilterSection title="Resort">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                paddingBottom: "8px",
              }}
            >
              <MultiSelectDropdown
                label="Country"
                options={countryOptions}
                selected={filters.countries}
                onChange={(v) => onUpdateFilter("countries", v)}
              />
              <DualRangeSlider
                label="Elevation"
                min={0}
                max={5000}
                valueLow={filters.elevationMin}
                valueHigh={filters.elevationMax}
                onChangeLow={(v) => onUpdateFilter("elevationMin", v)}
                onChangeHigh={(v) => onUpdateFilter("elevationMax", v)}
                unit="m"
                step={50}
              />
              <RangeSlider
                label="Vertical drop"
                min={0}
                max={3000}
                value={filters.verticalDropMin}
                onChange={(v) => onUpdateFilter("verticalDropMin", v)}
                unit="m"
                step={50}
              />
              <RangeSlider
                label="Run length"
                min={0}
                max={500}
                value={filters.totalRunLengthMinKm}
                onChange={(v) => onUpdateFilter("totalRunLengthMinKm", v)}
                unit="km"
              />
              <RangeSlider
                label="Lifts"
                min={0}
                max={100}
                value={filters.liftCountMin}
                onChange={(v) => onUpdateFilter("liftCountMin", v)}
              />
            </div>
          </FilterSection>

          {/* Terrain */}
          <FilterSection title="Terrain">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingBottom: "8px",
              }}
            >
              <Toggle
                label="Easy runs"
                checked={filters.hasEasyRuns}
                onChange={(v) => onUpdateFilter("hasEasyRuns", v)}
              />
              <Toggle
                label="Intermediate runs"
                checked={filters.hasIntermediateRuns}
                onChange={(v) => onUpdateFilter("hasIntermediateRuns", v)}
              />
              <Toggle
                label="Advanced runs"
                checked={filters.hasAdvancedRuns}
                onChange={(v) => onUpdateFilter("hasAdvancedRuns", v)}
              />
              <Toggle
                label="Expert runs"
                checked={filters.hasExpertRuns}
                onChange={(v) => onUpdateFilter("hasExpertRuns", v)}
              />
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  );
}
