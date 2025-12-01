import { defineStore } from "pinia";
import http from "../api/axios";

export const useBookStore = defineStore("book", {
  state: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 12,

    keyword: "",
    status: "",

    // 3 bộ lọc mới
    authorId: "",
    publisherId: "",
    categoryId: "",

    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await http.get("/books", {
          params: {
            page: this.page,
            limit: this.limit,

            keyword: this.keyword || undefined,
            status: this.status || undefined,

            authorId: this.authorId || undefined,
            publisherId: this.publisherId || undefined,
            categoryId: this.categoryId || undefined,
          },
        });

        this.items = res.data.data || [];
        this.total = res.data.total ?? this.items.length;
      } finally {
        this.loading = false;
      }
    },
  },
});
