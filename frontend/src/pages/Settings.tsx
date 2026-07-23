import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ChartSettings from "../components/settings/ChartSettings";
import LanguageSettings from "../components/settings/LanguageSettings";
import AISettings from "../components/settings/AISettings";
import ViewSettings from "../components/settings/ViewSettings";
import PlanSettings from "../components/settings/PlanSettings";

export default function Settings() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Settings
        </h1>

        <p className="text-slate-400 mt-2">
          Customize your InsightIQ experience.
        </p>
      </div>

      <AppearanceSettings />

      <ChartSettings />

      <NotificationSettings />

      <LanguageSettings />

      <AISettings />

      <ViewSettings />

      <PlanSettings />

    </div>
  );
}