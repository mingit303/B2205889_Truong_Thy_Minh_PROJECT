// src/api/uploadApi.js
import http from "./axios";

export const uploadApi = {
  uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return http.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage(publicId) {
    return http.delete("/upload/image", { data: { public_id: publicId } });
  },
};
