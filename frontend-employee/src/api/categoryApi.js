import http from "./axios";

export const categoryApi = {
  getList(params) {
    return http.get("/categories", { params });
  },

  getAll() {
    return http.get("/categories/all");
  },

  create(data) {
    return http.post("/categories", data);
  },

  update(id, data) {
    return http.put(`/categories/${id}`, data);
  },

  delete(id) {
    return http.delete(`/categories/${id}`);
  },
};
