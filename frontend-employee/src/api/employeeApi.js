import http from "./axios";

export const employeeApi = {
  getList(params) {
    return http.get("/employees", { params });
  },

  getById(id) {
    return http.get(`/employees/${id}`);
  },

  create(data) {
    return http.post("/employees", data);
  },

  update(id, data) {
    return http.put(`/employees/${id}`, data);
  },

  delete(id) {
    return http.delete(`/employees/${id}`);
  },

  toggleStatus(id) {
    return http.patch(`/employees/${id}/toggle-status`);
  },
};
