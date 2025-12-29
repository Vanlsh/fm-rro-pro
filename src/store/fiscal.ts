import { create } from "zustand";
import type { FiscalMemoryDump } from "@/lib/fm-types";

type FiscalState = {
  data: FiscalMemoryDump | null;
  path: string | null;
  message: string | null;
  setData: (data: FiscalMemoryDump | null) => void;
  setPath: (path: string | null) => void;
  setMessage: (message: string | null) => void;
};

export const useFiscalStore = create<FiscalState>((set) => ({
  data: null,
  path: null,
  message: null,
  setData: (data) => set({ data }),
  setPath: (path) => set({ path }),
  setMessage: (message) => set({ message }),
}));
