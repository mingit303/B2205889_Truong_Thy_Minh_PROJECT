import { defineStore } from "pinia";
import { categoryApi } from "../api/categoryApi";

export const useCategoryStore = defineStore("categories", {
  state: () => ({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    search: "",
    loading: false,
    all: [],
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await categoryApi.getList({
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
        });

        const data = res.data;
        this.items = data.data;
        this.total = data.pagination.total;
        this.page = data.pagination.page;
        this.limit = data.pagination.limit;

      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      const res = await categoryApi.getAll();
      this.all = res.data.data || res.data;
    },

    async create(payload) {
      await categoryApi.create(payload);
      await this.fetch();
      await this.fetchAll();
    },

    async update(id, payload) {
      await categoryApi.update(id, payload);
      await this.fetch();
      await this.fetchAll();
    },

    async remove(id) {
      await categoryApi.delete(id);

      if ((this.page - 1) * this.limit >= this.total - 1) {
        this.page = Math.max(1, this.page - 1);
      }

      await this.fetch();
      await this.fetchAll();
    },
  },
});
