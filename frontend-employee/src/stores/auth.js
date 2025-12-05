import { defineStore } from "pinia";
import api from "../api/axios";
import { useToast } from "../composables/useToast";
const toast = useToast();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.VaiTro === "SUPERADMIN",
    isAdmin: (state) =>
      state.user?.VaiTro === "ADMIN" || state.user?.VaiTro === "SUPERADMIN",
  },

  actions: {
    async loginEmployee(credentials) {
      try {
        this.loading = true;
        this.error = null;

        const res = await api.post("/auth/employee/login", credentials);
        const { token, user } = res.data.data;

        this.token = token;
        this.user = user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // toast.success("Đăng nhập thành công!");
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng nhập thất bại";
        toast.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return;

      try {
        const res = await api.get("/auth/me");
        this.user = res.data.data;

        localStorage.setItem("user", JSON.stringify(this.user));
        // toast.success("Lấy thông tin người dùng thành công!");
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
        toast.error("Không thể lấy thông tin người dùng.");
      }
    },

    logout() {
      this.token = "";
      this.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // toast.success("Đã đăng xuất!");
    },
  },
});
