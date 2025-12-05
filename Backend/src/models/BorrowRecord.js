// src/models/BorrowRecord.js
const mongoose = require("mongoose");

const BorrowRecordSchema = new mongoose.Schema(
  {
    MaDocGia: { type: String, required: true }, // mã độc giả (DG001...)
    MaSach: { type: String, required: true },   // mã sách (S001...)
    BookRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    },
    MSNV: { type: String, required: true },     // nhân viên tạo phiếu (MSNV)

    NgayMuon: { type: Date, required: true },
    HanTra: { type: Date, required: true },
    NgayTra: { type: Date },

    TrangThai: {
      type: String,
      enum: ["Đã mượn", "Đã trả", "Trễ hạn", "Hư hỏng", "Mất sách"],
      default: "Đã mượn",
    },

    SoLanGiaHan: { type: Number, default: 0 },
    SoLanTreHan: { type: Number, default: 0 }, // Đếm số lần đã trễ hạn

    // TIỀN PHẠT TỔNG
    TienPhat: { type: Number, default: 0 },
    LyDoXuPhat: { type: String },
    DaThanhToanPhat: { type: Boolean, default: false }, // Đã thanh toán tiền phạt

    MucDoHuHong: { type: String }, // Nhẹ / Nặng / Mất
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BorrowRecord",
  BorrowRecordSchema,
  "TheoDoiMuonSach"
);
