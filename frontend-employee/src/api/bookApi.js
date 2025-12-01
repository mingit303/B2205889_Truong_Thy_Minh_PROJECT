import http from "./axios";

export const bookApi = {
  getList(params) {
    return http.get("/books", { params });
  },

  getDetail(id) {
    return http.get(`/books/${id}`);
  },

  create(data, config = {}) {
    return http.post("/books", data, config);
  },

  update(id, data, config = {}) {
    return http.put(`/books/${id}`, data, config);
  },

  delete(id) {
    return http.delete(`/books/${id}`);
  },
};
