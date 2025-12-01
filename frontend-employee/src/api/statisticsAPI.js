// src/api/statistics.js
import api from "./axios";

export const statisticsApi = {
  getOverview() {
    return api.get("/statistics/overview");
  },

  getTopBooks() {
    return api.get("/statistics/top-books");
  },

  getTopReaders() {
    return api.get("/statistics/top-readers");
  },

  getBorrowReturn(year) {
    return api.get("/statistics/borrow-return", { params: { year } });
  },

  getStatusDistribution(params) {
    return api.get("/statistics/status-distribution", { params });
  },

  getFines(params) {
    return api.get("/statistics/fines", { params });
  },
};
