import { Checklist } from '@/common/types';
import { useState } from 'react';

// Hooks
export const useChecklistState = (value: Checklist[], onChange?: (value: Checklist[]) => void) => {
  const [collapsedStates, setCollapsedStates] = useState<{ [key: number]: boolean }>({});

  const updateChecklists = (updater: (checklists: Checklist[]) => Checklist[]) => {
    onChange?.(updater(value));
  };

  const addChecklist = () => {
    updateChecklists(checklists => [
      ...checklists,
      { name: '', items: [{ content: '', isDone: false }] },
    ]);
  };

  const removeChecklist = (index: number) => {
    updateChecklists(checklists => checklists.filter((_, idx) => idx !== index));
  };

  const updateChecklistName = (index: number, name: string) => {
    updateChecklists(checklists =>
      checklists.map((cl, idx) => (idx === index ? { ...cl, name } : cl)),
    );
  };

  const moveChecklist = (from: number, to: number) => {
    updateChecklists(checklists => {
      const newChecklists = [...checklists];
      const [moved] = newChecklists.splice(from, 1);
      newChecklists.splice(to, 0, moved);
      return newChecklists;
    });
  };

  const toggleCollapse = (index: number) => {
    setCollapsedStates(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addItem = (checklistIndex: number) => {
    const currentItems = value[checklistIndex]?.items || [];
    const hasEmptyItem = currentItems.some(item => !item.content?.trim());

    if (!hasEmptyItem) {
      updateChecklists(checklists =>
        checklists.map((cl, idx) =>
          idx === checklistIndex
            ? { ...cl, items: [...cl.items, { content: '', isDone: false }] }
            : cl,
        ),
      );
    }
  };

  const removeItem = (checklistIndex: number, itemIndex: number) => {
    updateChecklists(checklists =>
      checklists.map((cl, idx) =>
        idx === checklistIndex
          ? { ...cl, items: cl.items.filter((_, iidx) => iidx !== itemIndex) }
          : cl,
      ),
    );
  };

  const updateItem = (
    checklistIndex: number,
    itemIndex: number,
    updates: Partial<{ content: string; isDone: boolean }>,
  ) => {
    updateChecklists(checklists =>
      checklists.map((cl, idx) =>
        idx === checklistIndex
          ? {
              ...cl,
              items: cl.items.map((item, iidx) =>
                iidx === itemIndex ? { ...item, ...updates } : item,
              ),
            }
          : cl,
      ),
    );
  };

  return {
    collapsedStates,
    addChecklist,
    removeChecklist,
    updateChecklistName,
    moveChecklist,
    toggleCollapse,
    addItem,
    removeItem,
    updateItem,
  };
};
