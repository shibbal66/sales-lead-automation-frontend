import { create } from "zustand";

interface PlanLimitDialogState {
  open: boolean;
  message: string;
  code: string | null;
  openDialog: (payload: { message: string; code: string | null }) => void;
  closeDialog: () => void;
}

export const usePlanLimitStore = create<PlanLimitDialogState>((set) => ({
  open: false,
  message: "",
  code: null,
  openDialog: ({ message, code }) => set({ open: true, message, code }),
  closeDialog: () => set({ open: false, message: "", code: null })
}));
