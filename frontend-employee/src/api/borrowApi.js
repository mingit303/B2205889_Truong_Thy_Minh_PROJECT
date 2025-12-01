// src/api/borrowApi.js
import http from "./axios";

export const borrowApi = {
  getList(params) {
    return http.get("/borrows", { params });
  },

  create(data) {
    return http.post("/borrows", data);
  },

  returnBook(id) {
    return http.put(`/borrows/${id}/return`);
  },

  extendBorrow(id) {
    return http.put(`/borrows/${id}/extend`);
  },

  reportDamaged(id, data) {
    return http.put(`/borrows/${id}/report-damaged`, data);
  },

  reportLost(id, data) {
    return http.put(`/borrows/${id}/report-lost`, data);
  },

  markPaid(id) {
    return http.put(`/borrows/${id}/paid`);
  },

  getMyHistory(params) {
    return http.get("/borrows/my-history", { params });
  },

  getOverdue() {
    return http.get("/borrows/overdue");
  },
};
