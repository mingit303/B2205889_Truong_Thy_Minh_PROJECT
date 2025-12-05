import { defineStore } from "pinia";
import http from "../api/axios";

export const useRequestStore = defineStore("request", {
  state: () => ({
    items: [],
  }),

  actions: {
    async create(data) {
      const res = await http.post("/request", data);
      console.log("REQUEST CREATED:", res.data);
      return res.data;
    },

    async fetchMine() {
      const res = await http.get("/request/my");
      this.items = res.data.data;
    },
  },
});
