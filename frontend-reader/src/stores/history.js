import { defineStore } from "pinia";
import http from "../api/axios";

export const useHistoryStore = defineStore("history", {
  state: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 5,
    status: "",
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;

      const res = await http.get("/history", {
        params: {
          page: this.page,
          limit: this.limit,
          status: this.status || undefined,
        },
      });

      this.items = res.data.data;
      this.total = res.data.pagination?.total || 0;
      this.loading = false;
    },
  },
});
