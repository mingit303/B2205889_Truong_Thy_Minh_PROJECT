// src/api/publisherApi.js
import http from "./axios";

export const publisherApi = {
  getAll() {
    // backend đang phân trang, nhưng có thể cho limit lớn + search rỗng
    return http.get("/publishers", { params: { page: 1, limit: 1000, search: "" } });
  },

  getList(params) {
    return http.get("/publishers", { params });
  },


  create(data) {
    return http.post("/publishers", data);
  },

  update(id, data) {
    return http.put(`/publishers/${id}`, data);
  },

  delete(id) {
    return http.delete(`/publishers/${id}`);
  },
};
