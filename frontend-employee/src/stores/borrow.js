import { defineStore } from "pinia";
import http from "../api/axios";

export const useBorrowStore = defineStore("borrow", {
  state: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    search: "",
    status: "",
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await http.get("/borrows", {
          params: {
            page: this.page,
            limit: this.limit,
            search: this.search,
            status: this.status,
          },
        });

        this.items = res.data.data;
        this.total = res.data.pagination?.total || 0;
      } finally {
        this.loading = false;
      }
    },

    async createBorrow(payload) {
      await http.post("/borrows", payload);
      await this.fetch();
    },

    async returnBook(id) {
      await http.put(`/borrows/${id}/return`);
      await this.fetch();
    },

    async extendBorrow(id) {
      await http.put(`/borrows/${id}/extend`);
      await this.fetch();
    },

    async reportDamaged(id, data) {
      await http.put(`/borrows/${id}/report-damaged`, data);
      await this.fetch();
    },

    async reportLost(id, data) {
      await http.put(`/borrows/${id}/report-lost`, data);
      await this.fetch();
    },

    async markPaid(id) {
      await http.put(`/borrows/${id}/paid`);
      await this.fetch();
    },
  },
});
