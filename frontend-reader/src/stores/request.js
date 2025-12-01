import { defineStore } from "pinia";
import http from "../api/axios";

export const useRequestStore = defineStore("request", {
  state: () => ({
    items: [],
  }),

  actions: {
    async create(data) {
  try {
    const res = await http.post("/request", data);
    console.log("REQUEST CREATED:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response?.data || err);
  }
},

    async fetchMine() {
      const res = await http.get("/request/my");
      this.items = res.data.data;
    },
  },
});
