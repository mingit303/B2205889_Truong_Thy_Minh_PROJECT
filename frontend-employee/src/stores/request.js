import { defineStore } from "pinia";
import http from "../api/axios";

export const useRequestStore = defineStore("request-admin", {
  state: () => ({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    status: "",
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await http.get("/requests", {
          params: {
            page: this.page,
            limit: this.limit,
            status: this.status,
          },
        });

        this.items = res.data.data;
        this.total = res.data.pagination?.total || 0;
      } finally {
        this.loading = false;
      }
    },

    async approve(id) {
      await http.put(`/requests/${id}/approve`);
      await this.fetch();
    },

    async reject(id, reason) {
      await http.put(`/requests/${id}/reject`, { reason });
      await this.fetch();
    },
  },
});
