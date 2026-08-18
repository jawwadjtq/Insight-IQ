import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import type { Language } from "./LanguageContext";

/* =========================================================
   TYPES
========================================================= */

export type FontSize =
  | "small"
  | "medium"
  | "large";

export type ChartType =
  | "bar"
  | "line"
  | "area";

export type ViewDensity =
  | "comfortable"
  | "compact";

export type Plan =
  | "free"
  | "pro"
  | "enterprise";

export type AIModel =
  | "gemini"
  | "gemini-fast"
  | "gemini-pro";

export type AIResponseStyle =
  | "concise"
  | "balanced"
  | "detailed";

/* =========================================================
   MAIN SETTINGS
========================================================= */

export interface AppSettings {
  /* =======================================================
     APPEARANCE
  ======================================================= */

  fontSize: FontSize;

  /* =======================================================
     CHARTS
  ======================================================= */

  chartType: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  notifications: boolean;
  reportNotifications: boolean;
  analysisNotifications: boolean;
  aiNotifications: boolean;
  securityAlerts: boolean;

  /* =======================================================
     LANGUAGE
  ======================================================= */

  language: Language;

  /* =======================================================
     AI
  ======================================================= */

  aiEnabled: boolean;
  aiModel: AIModel;
  aiResponseStyle: AIResponseStyle;
  aiAutoInsights: boolean;
  aiRecommendations: boolean;
  aiAnomalyDetection: boolean;

  /* =======================================================
     VIEW
  ======================================================= */

  compactMode: boolean;
  showAnimations: boolean;

  /* =======================================================
     PLAN
  ======================================================= */

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
  aiModel: "gemini",
  aiResponseStyle: "balanced",
  aiAutoInsights: true,
  aiRecommendations: true,
  aiAnomalyDetection: true,

  /* View */

  compactMode: false,
  showAnimations: true,

  /* Plan */

  plan: "free",
};

/* =========================================================
   GROUPED CHART SETTINGS
========================================================= */

export interface ChartSettings {
  chartType: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;
}

/* =========================================================
   GROUPED VIEW SETTINGS
========================================================= */

export interface ViewSettings {
  compactMode: boolean;
  animations: boolean;
}

/* =========================================================
   GROUPED AI SETTINGS
========================================================= */

export interface AISettings {
  enabled: boolean;
  model: AIModel;
  responseStyle: AIResponseStyle;
  automaticInsights: boolean;
  recommendations: boolean;
  anomalyDetection: boolean;
}

/* =========================================================
   GROUPED NOTIFICATION SETTINGS
========================================================= */

export interface NotificationSettings {
  notifications: boolean;
  reportNotifications: boolean;
  analysisNotifications: boolean;
  aiNotifications: boolean;
  securityAlerts: boolean;
}

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface AppSettingsContextType {
  settings: AppSettings;

  chartSettings: ChartSettings;

  viewSettings: ViewSettings;

  aiSettings: AISettings;

  notificationSettings: NotificationSettings;

  updateSetting: <
    K extends keyof AppSettings
  >(
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

const AppSettingsContext =
  createContext<
    AppSettingsContextType | undefined
  >(undefined);

/* =========================================================
   STORAGE KEY
========================================================= */

const SETTINGS_STORAGE_KEY =
  "insightiq-settings";

const LANGUAGE_STORAGE_KEY =
  "insightiq-language";

/* =========================================================
   PROVIDER
========================================================= */

export function AppSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  const [settings, setSettings] =
    useState<AppSettings>(() => {
      try {
        const saved =
          localStorage.getItem(
            SETTINGS_STORAGE_KEY
          );

        if (!saved) {
          return defaultSettings;
        }

        const parsed: Partial<AppSettings> =
          JSON.parse(saved);

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
    });

  /* =======================================================
     SAVE ALL SETTINGS
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
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
     LANGUAGE STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        settings.language
      );
    } catch (error) {
      console.error(
        "Failed to save language preference:",
        error
      );
    }
  }, [settings.language]);

  /* =======================================================
     GLOBAL FONT SIZE
  ======================================================= */

  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.remove(
      "text-size-small",
      "text-size-medium",
      "text-size-large"
    );

    root.classList.add(
      `text-size-${settings.fontSize}`
    );
  }, [settings.fontSize]);

  /* =======================================================
     GLOBAL COMPACT MODE
  ======================================================= */

  useEffect(() => {
    const root =
      document.documentElement;

    if (settings.compactMode) {
      root.classList.add(
        "compact-mode"
      );
    } else {
      root.classList.remove(
        "compact-mode"
      );
    }
  }, [settings.compactMode]);

  /* =======================================================
     GLOBAL ANIMATIONS
  ======================================================= */

  useEffect(() => {
    const root =
      document.documentElement;

    if (settings.showAnimations) {
      root.classList.remove(
        "no-animations"
      );
    } else {
      root.classList.add(
        "no-animations"
      );
    }
  }, [settings.showAnimations]);

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
     RESET ALL SETTINGS
  ======================================================= */

  const resetSettings = () => {
    setSettings({
      ...defaultSettings,
    });

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
          defaultSettings
        )
      );

      localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        defaultSettings.language
      );
    } catch (error) {
      console.error(
        "Failed to reset InsightIQ settings:",
        error
      );
    }
  };

  /* =======================================================
     GROUPED CHART SETTINGS
  ======================================================= */

  const chartSettings =
    useMemo<ChartSettings>(
      () => ({
        chartType:
          settings.chartType,

        showGrid:
          settings.showGrid,

        showLegend:
          settings.showLegend,

        showTooltip:
          settings.showTooltip,

        animations:
          settings.animations,
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
     GROUPED VIEW SETTINGS
  ======================================================= */

  const viewSettings =
    useMemo<ViewSettings>(
      () => ({
        compactMode:
          settings.compactMode,

        animations:
          settings.showAnimations,
      }),
      [
        settings.compactMode,
        settings.showAnimations,
      ]
    );

  /* =======================================================
     GROUPED AI SETTINGS
  ======================================================= */

  const aiSettings =
    useMemo<AISettings>(
      () => ({
        enabled:
          settings.aiEnabled,

        model:
          settings.aiModel,

        responseStyle:
          settings.aiResponseStyle,

        automaticInsights:
          settings.aiAutoInsights,

        recommendations:
          settings.aiRecommendations,

        anomalyDetection:
          settings.aiAnomalyDetection,
      }),
      [
        settings.aiEnabled,
        settings.aiModel,
        settings.aiResponseStyle,
        settings.aiAutoInsights,
        settings.aiRecommendations,
        settings.aiAnomalyDetection,
      ]
    );

  /* =======================================================
     GROUPED NOTIFICATION SETTINGS
  ======================================================= */

  const notificationSettings =
    useMemo<NotificationSettings>(
      () => ({
        notifications:
          settings.notifications,

        reportNotifications:
          settings.reportNotifications,

        analysisNotifications:
          settings.analysisNotifications,

        aiNotifications:
          settings.aiNotifications,

        securityAlerts:
          settings.securityAlerts,
      }),
      [
        settings.notifications,
        settings.reportNotifications,
        settings.analysisNotifications,
        settings.aiNotifications,
        settings.securityAlerts,
      ]
    );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <AppSettingsContext.Provider
      value={{
        settings,

        chartSettings,

        viewSettings,

        aiSettings,

        notificationSettings,

        updateSetting,

        updateSettings,

        resetSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAppSettings() {
  const context =
    useContext(
      AppSettingsContext
    );

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside AppSettingsProvider"
    );
  }

  return context;
}