import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

/* =========================================================
   TYPES
========================================================= */

export type FontSize = "small" | "medium" | "large";

export type ChartType = "bar" | "line" | "area";

export type Language = "English" | "Urdu";

export type ViewDensity = "comfortable" | "compact";

export type Plan = "free" | "pro" | "enterprise";

/* =========================================================
   APP SETTINGS
========================================================= */

export interface AppSettings {
  /* Appearance */
  fontSize: FontSize;

  /* Charts */
  chartType: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;

  /* Notifications */
  notifications: boolean;
  reportNotifications: boolean;
  analysisNotifications: boolean;
  aiNotifications: boolean;
  securityAlerts: boolean;

  /* Language */
  language: Language;

  /* AI */
  aiEnabled: boolean;
  aiAutoInsights: boolean;

  /* View */
  compactMode: boolean;
  showAnimations: boolean;

  /* Plan */
  plan: Plan;
}

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

export const defaultSettings: AppSettings = {
  /* Appearance */
  fontSize: "medium",

  /* Charts */
  chartType: "bar",
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  animations: true,

  /* Notifications */
  notifications: true,
  reportNotifications: true,
  analysisNotifications: true,
  aiNotifications: true,
  securityAlerts: true,

  /* Language */
  language: "English",

  /* AI */
  aiEnabled: true,
  aiAutoInsights: true,

  /* View */
  compactMode: false,
  showAnimations: true,

  /* Plan */
  plan: "free",
};

/* =========================================================
   GROUPED SETTINGS
========================================================= */

export interface ChartSettings {
  chartType: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;
}

export interface ViewSettings {
  compactMode: boolean;
  animations: boolean;
}

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface SettingsContextType {
  settings: AppSettings;

  chartSettings: ChartSettings;

  viewSettings: ViewSettings;

  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;

  updateSettings: (
    updates: Partial<AppSettings>
  ) => void;

  resetSettings: () => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const SettingsContext =
  createContext<SettingsContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE KEY
========================================================= */

const STORAGE_KEY = "insightiq-settings";

/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultSettings;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Failed to load InsightIQ settings:",
      error
    );

    return defaultSettings;
  }
}

/* =========================================================
   PROVIDER
========================================================= */

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<AppSettings>(loadSettings);

  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        "Failed to save InsightIQ settings:",
        error
      );
    }
  }, [settings]);

  /* =======================================================
     GLOBAL FONT SIZE
  ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove(
      "text-size-small",
      "text-size-medium",
      "text-size-large"
    );

    root.classList.add(
      `text-size-${settings.fontSize}`
    );

    /*
     * Also expose the current font size as
     * a data attribute so other components
     * can access it if needed.
     */

    root.setAttribute(
      "data-font-size",
      settings.fontSize
    );
  }, [settings.fontSize]);

  /* =======================================================
     GLOBAL COMPACT MODE
  ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    if (settings.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [settings.compactMode]);

  /* =======================================================
     GLOBAL ANIMATIONS
  ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    if (settings.showAnimations) {
      root.classList.remove("reduce-motion");
    } else {
      root.classList.add("reduce-motion");
    }
  }, [settings.showAnimations]);

  /* =======================================================
     GLOBAL LANGUAGE
  ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(
      "lang",
      settings.language === "Urdu"
        ? "ur"
        : "en"
    );

    /*
     * Urdu direction.
     * English remains left-to-right.
     */

    if (settings.language === "Urdu") {
      root.setAttribute("dir", "rtl");
    } else {
      root.setAttribute("dir", "ltr");
    }
  }, [settings.language]);

  /* =======================================================
     UPDATE ONE SETTING
  ======================================================= */

  const updateSetting = <
    K extends keyof AppSettings
  >(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     UPDATE MULTIPLE SETTINGS
  ======================================================= */

  const updateSettings = (
    updates: Partial<AppSettings>
  ) => {
    setSettings((current) => ({
      ...current,
      ...updates,
    }));
  };

  /* =======================================================
     RESET SETTINGS
  ======================================================= */

  const resetSettings = () => {
    setSettings({
      ...defaultSettings,
    });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultSettings)
      );
    } catch (error) {
      console.error(
        "Failed to reset InsightIQ settings:",
        error
      );
    }
  };

  /* =======================================================
     CHART SETTINGS
  ======================================================= */

  const chartSettings = useMemo<ChartSettings>(
    () => ({
      chartType: settings.chartType,
      showGrid: settings.showGrid,
      showLegend: settings.showLegend,
      showTooltip: settings.showTooltip,
      animations: settings.animations,
    }),
    [
      settings.chartType,
      settings.showGrid,
      settings.showLegend,
      settings.showTooltip,
      settings.animations,
    ]
  );

  /* =======================================================
     VIEW SETTINGS
  ======================================================= */

  const viewSettings = useMemo<ViewSettings>(
    () => ({
      compactMode: settings.compactMode,
      animations: settings.showAnimations,
    }),
    [
      settings.compactMode,
      settings.showAnimations,
    ]
  );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <SettingsContext.Provider
      value={{
        settings,

        chartSettings,

        viewSettings,

        updateSetting,

        updateSettings,

        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}

/* =========================================================
   ALIAS
========================================================= */

/*
 * Keeps compatibility with components that still use
 * useAppSettings().
 */

export const useAppSettings = useSettings;