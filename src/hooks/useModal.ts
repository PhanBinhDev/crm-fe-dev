import { ModalType } from '@/common/types/modal';
import { create } from 'zustand';

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  openModal: (type: ModalType, data?: Record<string, any>) => void;
  closeModal: () => void;
  data: Record<string, any> | null;
  setData: (data: Record<string, any>) => void;
}

export const useModal = create<ModalStore>(set => ({
  type: null,
  isOpen: false,
  openModal: (type, data) => set({ isOpen: true, type, data }),
  closeModal: () => set({ isOpen: false, type: null }),
  data: null,
  setData: data => set({ data }),
  resetData: () => set({ data: null }),
}));
