import type { ChartSettings } from "../../context/AppSettingsContext";

export interface ChartVisualConfig {
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;
}

export function getChartVisualConfig(
  settings: ChartSettings
): ChartVisualConfig {
  return {
    showGrid: settings.showGrid,
    showLegend: settings.showLegend,
    showTooltip: settings.showTooltip,
    animations: settings.animations,
  };
}