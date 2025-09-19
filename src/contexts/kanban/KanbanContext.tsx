import { IActivity } from '@/common/types';
import { createContext, useContext, ReactNode } from 'react';

interface KanbanContextType {
  updateLocalActivity: (activityId: string, updates: Partial<IActivity>) => void;
  removeLocalActivity: (activityId: string) => void;
  addLocalActivity: (activity: IActivity) => void;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

interface KanbanProviderProps {
  children: ReactNode;
  value: KanbanContextType;
}

export const KanbanProvider = ({ children, value }: KanbanProviderProps) => {
  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanbanContext must be used within a KanbanProvider');
  }
  return context;
};
