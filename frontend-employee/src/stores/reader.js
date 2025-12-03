// src/stores/reader.js
import { defineStore } from "pinia";
import { readerApi } from "../api/readerApi";

export const useReaderStore = defineStore("readers", {
  state: () => ({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    search: "",
    gender: "",
    status: "",
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;

      try {
        const res = await readerApi.getList({
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
          gender: this.gender || undefined,
          status: this.status || undefined,
        });

        const data = res.data;

        this.items = data.data || [];
        this.total = data.pagination.total;
        this.page = data.pagination.page;
        this.limit = data.pagination.limit;

      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      await readerApi.create(payload);
      await this.fetch();
    },

    async update(id, payload) {
      await readerApi.update(id, payload);
      await this.fetch();
    },

    async remove(id) {
      await readerApi.delete(id);

      if ((this.page - 1) * this.limit >= this.total - 1) {
        this.page = Math.max(1, this.page - 1);
      }

      await this.fetch();
    },

    async toggleStatus(id) {
      await readerApi.toggleStatus(id);
      await this.fetch();
    },
  },
});
