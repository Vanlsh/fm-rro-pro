import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type IpStore = {
  ip: string | null;
  setIp: (value: string) => void;
};

export const useIpStore = create<IpStore>()(
  persist(
    (set) => ({
      ip: null,
      setIp: (value) => set({ ip: value }),
    }),
    {
      name: "ip-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const selectIp = (state: IpStore) => state.ip;
