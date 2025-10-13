// DisplayConfigContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

export interface DisplayConfig {
  showAssignee: boolean;
  showEndTime: boolean;
  // showStartTime: boolean;
  showEstimate: boolean;
  showPriority: boolean;
  showDescription: boolean;
  showProgress: boolean;
  showSubtask: boolean;
  showType: boolean;
  showCompleted: boolean;
}

export const defaultConfig: DisplayConfig = {
  showAssignee: false,
  showEstimate: true,
  showEndTime: true,
  // showStartTime: false,
  showPriority: true,
  showDescription: false,
  showProgress: false,
  showSubtask: false,
  showType: false,
  showCompleted: false,
};

interface DisplayConfigContextType {
  config: DisplayConfig;
  setConfig: React.Dispatch<React.SetStateAction<DisplayConfig>>;
}

const DisplayConfigContext = createContext<DisplayConfigContextType | undefined>(undefined);

export const DisplayConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageKey = 'displaySetting';

  const loadConfig = (): DisplayConfig => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  };

  const [config, setConfig] = useState<DisplayConfig>(loadConfig);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (error) {
      console.warn('Could not save display config to localStorage:', error);
    }
  }, [config]);

  return (
    <DisplayConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </DisplayConfigContext.Provider>
  );
};

export function useDisplayConfig() {
  const context = useContext(DisplayConfigContext);
  if (!context) {
    throw new Error('useDisplayConfig must be used within DisplayConfigProvider');
  }
  return context;
}
