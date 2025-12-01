const mongoose = require("mongoose");

const BorrowRequestSchema = new mongoose.Schema(
  {
    MaDocGia: { type: String, required: true },

    Sach: [{ type: String, required: true }], // danh sách mã sách

    TrangThai: {
      type: String,
      enum: ["CHO_DUYET", "DA_DUYET", "TU_CHOI"],
      default: "CHO_DUYET",
    },

    LyDoTuChoi: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BorrowRequest",
  BorrowRequestSchema,
  "YeuCauMuonSach"
);
