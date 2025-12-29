import type { Product } from "@/lib/types";
import { create } from "zustand";

type ProductStore = {
  product: Product[] | null;
  setProduct: (value: Product[]) => void;
  fetchProduct: (ip: string) => void;
  updateGroup: (data: { previousName: string; newName: string }) => void;
  addGroup: (group: string) => void;
  additionalGroups: string[];
  error: boolean;
};

export const useProductStore = create<ProductStore>()((set, get) => ({
  product: null,
  error: false,
  additionalGroups: [],
  setProduct: (value) => set({ product: value }),
  fetchProduct: async (ip: string) => {
    set({ product: [], error: false });
    try {
      const response = await window.api.getArticles(ip);

      if (response.success && response.data.success) {
        set({ product: response.data.articles });
      } else {
        set({ product: [] });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ product: [], error: true });
    }
  },
  updateGroup({
    previousName,
    newName,
  }: {
    previousName: string;
    newName: string;
  }) {
    const { additionalGroups } = get();
    const groups = additionalGroups.map((group) =>
      group === previousName ? newName : group
    );
    set({ additionalGroups: groups });
  },
  addGroup(group: string) {
    const { additionalGroups } = get();
    additionalGroups.push(group);
    set({ additionalGroups });
  },
}));

export const selectProduct = (state: ProductStore) => state.product;

export const selectUniqueGroups = (state: ProductStore) =>
  state.product
    ? [...new Set(state.product.map((p) => p.group).filter(Boolean))]
    : null;
