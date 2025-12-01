const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  MSNV: { type: String, required: true, unique: true },
  HoTenNV: String,
  Password: String, // bcrypt hash
  ChucVu: String,
  DiaChi: String,
  SoDienThoai: String,
  VaiTro: { type: String, enum: ["SUPERADMIN", "ADMIN"], default: "ADMIN" },
  TrangThai: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema, "NhanVien");
