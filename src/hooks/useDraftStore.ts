import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftData {
  id: string;
  type: 'task' | 'event' | 'reminder';
  title: string;
  data: any;
  createdAt: number;
  updatedAt: number;
}

interface DraftStore {
  drafts: DraftData[];
  isMinimized: boolean;
  activeDraftId: string | null;

  // Actions
  saveDraft: (draft: Omit<DraftData, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDraft: (id: string, data: Partial<DraftData>) => void;
  deleteDraft: (id: string) => void;
  setMinimized: (minimized: boolean) => void;
  setActiveDraft: (id: string | null) => void;
  clearDrafts: () => void;
  getDraft: (id: string) => DraftData | undefined;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      drafts: [],
      isMinimized: false,
      activeDraftId: null,

      saveDraft: draftData => {
        const id = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const draft: DraftData = {
          id,
          ...draftData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set(state => ({
          drafts: [...state.drafts, draft],
          activeDraftId: id,
        }));

        return id;
      },

      updateDraft: (id, data) => {
        set(state => ({
          drafts: state.drafts.map(draft =>
            draft.id === id ? { ...draft, ...data, updatedAt: Date.now() } : draft,
          ),
        }));
      },

      deleteDraft: id => {
        set(state => ({
          drafts: state.drafts.filter(draft => draft.id !== id),
          activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
        }));
      },

      setMinimized: minimized => {
        set({ isMinimized: minimized });
      },

      setActiveDraft: id => {
        set({ activeDraftId: id });
      },

      clearDrafts: () => {
        set({ drafts: [], activeDraftId: null });
      },

      getDraft: id => {
        return get().drafts.find(draft => draft.id === id);
      },
    }),
    {
      name: 'draft-storage',
      partialize: state => ({
        drafts: state.drafts,
        isMinimized: state.isMinimized,
        activeDraftId: state.activeDraftId,
      }),
    },
  ),
);
