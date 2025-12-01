const mongoose = require("mongoose");

const PublisherSchema = new mongoose.Schema({
  MaNXB: { type: String, required: true, unique: true },
  TenNXB: String,
  DiaChi: String
});

module.exports = mongoose.model("Publisher", PublisherSchema, "NhaXuatBan");
