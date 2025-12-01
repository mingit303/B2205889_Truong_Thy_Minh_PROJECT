// src/api/readerApi.js
import http from "./axios";

export const readerApi = {
  getList(params) {
    return http.get("/readers", { params });
  },

  getById(id) {
    return http.get(`/readers/${id}`);
  },

  create(data) {
    return http.post("/readers", data);
  },

  update(id, data) {
    return http.put(`/readers/${id}`, data);
  },

  delete(id) {
    return http.delete(`/readers/${id}`);
  },

  toggleStatus(id) {
    return http.patch(`/readers/${id}/toggle-status`);
  },
};
