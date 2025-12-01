const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    MaSach: { type: String, required: true, unique: true },
    TenSach: { type: String, required: true },

    // Chuẩn hóa: lưu ObjectId, populate ra Category / Publisher / Author
    MaTheLoai: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    MaNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    },
    MaTacGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },

    DonGia: Number,
    SoQuyen: Number,
    NamXuatBan: Number,

    MoTa: String,
    // Lưu URL đầy đủ: http://localhost:3000/uploads/books/xxx.jpg
    AnhBia: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema, "Sach");
