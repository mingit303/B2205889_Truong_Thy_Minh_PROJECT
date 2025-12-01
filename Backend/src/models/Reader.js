const mongoose = require("mongoose");

const ReaderSchema = new mongoose.Schema(
  {
    MaDocGia: { type: String, required: true, unique: true },
    HoLot: String,
    Ten: String,
    NgaySinh: Date,
    Phai: String,
    DiaChi: String,
    DienThoai: String,
    Email: { type: String, unique: true },
    MatKhau: String,
    TrangThai: { type: Number, default: 1 }, // 1 = active, 0 = locked
    Cart: {
      type: [String],      // danh sách MaSach
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reader", ReaderSchema, "DocGia");
