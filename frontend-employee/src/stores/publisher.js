import { defineStore } from "pinia";
import { publisherApi } from "../api/publisherApi";

export const usePublisherStore = defineStore("publishers", {
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
        const res = await publisherApi.getList({
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

    async create(payload) {
      await publisherApi.create(payload);
      await this.fetch();
    },

    async update(id, payload) {
      await publisherApi.update(id, payload);
      await this.fetch();
    },

    async remove(id) {
      await publisherApi.delete(id);

      if ((this.page - 1) * this.limit >= this.total - 1) {
        this.page = Math.max(1, this.page - 1);
      }

      await this.fetch();
    },
  },
});
