import { defineStore } from "pinia";
import { authorApi } from "../api/authorApi";

export const useAuthorStore = defineStore("authors", {
  state: () => ({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    search: "",
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await authorApi.getList({
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
        });

        const data = res.data;

        this.items = data.data;                  // mảng tác giả
        this.total = data.pagination.total;      // số record thật
        this.page = data.pagination.page;        // trang hiện tại
        this.limit = data.pagination.limit;    
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      await authorApi.create(payload);
      await this.fetch();
    },

    async update(id, payload) {
      await authorApi.update(id, payload);
      await this.fetch();
    },

    async remove(id) {
      await authorApi.delete(id);

      if ((this.page - 1) * this.limit >= this.total - 1) {
        this.page = Math.max(1, this.page - 1);
      }

      await this.fetch();
    },
  },
});
