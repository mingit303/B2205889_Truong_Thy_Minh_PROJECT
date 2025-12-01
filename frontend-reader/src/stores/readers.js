import { defineStore } from "pinia";
import http from "../api/axios";

export const useReaderStore = defineStore("readerStore", {
  actions: {
    updateProfile(data) {
      return http.put("/me", data);
    },

    changePassword(data) {
      return http.put("/change-password", data);
    },
  },
});
