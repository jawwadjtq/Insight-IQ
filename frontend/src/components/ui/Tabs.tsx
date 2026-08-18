import {
  useState,
  type ReactNode,
} from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  defaultTab,
  onChange,
  children,
  className = "",
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(
    defaultTab || tabs[0]?.id || ""
  );

  const currentTab = activeTab ?? internalTab;

  const handleChange = (tabId: string) => {
    setInternalTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}

      <div
        className="
          overflow-x-auto

          border-b
          border-slate-200
          dark:border-slate-800
        "
      >
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => handleChange(tab.id)}
                className={`
                  relative

                  flex
                  items-center
                  gap-2

                  whitespace-nowrap

                  px-4
                  py-3

                  text-sm
                  font-semibold

                  transition-all
                  duration-200

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  ${
                    isActive
                      ? `
                        text-blue-600
                        dark:text-blue-400
                      `
                      : `
                        text-slate-500
                        dark:text-slate-400

                        hover:text-slate-900
                        dark:hover:text-white
                      `
                  }
                `}
              >
                {tab.icon}

                {tab.label}

                {/* Active Indicator */}

                {isActive && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-2
                      right-2

                      h-0.5

                      rounded-full

                      bg-blue-600
                      dark:bg-blue-400
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}

      <div className="pt-6">
        {children}
      </div>
    </div>
  );
}