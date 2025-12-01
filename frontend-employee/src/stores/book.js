import { defineStore } from "pinia";
import { bookApi } from "../api/bookApi";

export const useBookStore = defineStore("books", {
  state: () => ({
    items: [],
    page: 1,
    limit: 5,
    total: 0,
    loading: false,

    // filters
    search: "",
    category: "",
    publisher: "",
    author: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
          category: this.category || undefined,
          publisher: this.publisher || undefined,
          author: this.author || undefined,
          minPrice: this.minPrice || undefined,
          maxPrice: this.maxPrice || undefined,
          minYear: this.minYear || undefined,
          maxYear: this.maxYear || undefined,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        };

        const res = await bookApi.getList(params);

        this.items = res.data.data || [];
        this.page = res.data.page || this.page;
        this.limit = res.data.limit || this.limit;
        this.total = res.data.total || 0;
      } finally {
        this.loading = false;
      }
    },

    setPage(p) {
      this.page = p;
      this.fetch();
    },

    async create(payload, isFormData = false) {
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : {};

      await bookApi.create(payload, { headers });
      await this.fetch();
    },

    async update(id, payload, isFormData = false) {
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : {};

      await bookApi.update(id, payload, { headers });
      await this.fetch();
    },

    async remove(id) {
      await bookApi.delete(id);

      if ((this.page - 1) * this.limit >= this.total - 1 && this.page > 1) {
        this.page -= 1;
      }
      await this.fetch();
    },
  },
});
