import { defineStore } from "pinia";
import http from "../api/axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async load() {
      const res = await http.get("/cart");
      this.items = res.data.data || [];
    },

    async add(maSach) {
      const res = await http.post("/cart/add", { MaSach: maSach });

      // 🔥 Update lại items từ BE
      this.items = res.data.data;

      console.log("Cart after add:", this.items);
    },

    async remove(id) {
      const res = await http.delete(`/cart/remove/${id}`);

      // 🔥 Update lại items
      this.items = res.data.data;
    },

    async clear() {
      await http.delete("/cart/clear");
      this.items = [];
    },
  },
});
