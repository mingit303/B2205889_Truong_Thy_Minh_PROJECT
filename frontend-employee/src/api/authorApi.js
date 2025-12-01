import http from "./axios";

export const authorApi = {
  getList(params) {
    return http.get("/authors", { params });
  },

  getAll() {
    return http.get("/authors", { params: { page: 1, limit: 9999 } });
  },

  create(data) {
    return http.post("/authors", data);
  },

  update(id, data) {
    return http.put(`/authors/${id}`, data);
  },

  delete(id) {
    return http.delete(`/authors/${id}`);
  },
};
