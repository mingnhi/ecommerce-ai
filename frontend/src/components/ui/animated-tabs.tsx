"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import { twMerge } from "tailwind-merge";

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={twMerge(
      "flex bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
      className
    )}
  >
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={twMerge(
        "relative flex-1 px-6 py-3 text-sm font-medium rounded-md transition-all duration-200",
        className
      )}
    >
      <span
        className={twMerge(
          "relative z-10 capitalize transition-colors duration-300 flex items-center justify-center",
          isActive
            ? "text-white dark:text-black"
            : "text-gray-600 dark:text-gray-400 hover:text-blue-300 dark:hover:text-blue-300"
        )}
      >
        {children}
      </span>
      <span
        className={twMerge(
          "absolute bottom-0 left-0 h-full w-full origin-bottom scale-y-0 transition-transform duration-500 ease-out z-0 rounded-t-md",
          isActive ? "scale-y-100 bg-blue-400 dark:bg-white" : "bg-transparent"
        )}
      />
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsContent = ({
  value,
  children,
  className,
}: TabsContentProps): ReactElement | null => {
  const { activeTab } = useTabsContext();
  return activeTab === value ? (
    <div className={twMerge("py-4", className)}>{children}</div>
  ) : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };