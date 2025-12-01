import { defineStore } from "pinia";
import http from "../api/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    reader: null,
    token: localStorage.getItem("reader_token") || "",
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
  },

  actions: {
    async login(data) {
      const res = await http.post("/auth/login", data);

      this.token = res.data.token;
      this.reader = res.data.reader;

      localStorage.setItem("reader_token", this.token);
    },

    async register(data) {
      await http.post("/auth/register", data);
    },

    async loadProfile() {
      const res = await http.get("/me");
      this.reader = res.data.data;
    },

    async init() {
      if (this.token && !this.reader) {
        try {
          const res = await http.get("/me");
          this.reader = res.data.data;
        } catch (err) {
          this.logout();
        }
      }
    },

    logout() {
      this.reader = null;
      this.token = "";
      localStorage.removeItem("reader_token");
    },

  },
});
