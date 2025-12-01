const BorrowRequest = require("../models/BorrowRequest");
const BorrowRecord = require("../models/BorrowRecord");
const Book = require("../models/Book");
const Reader = require("../models/Reader");
const Config = require("../models/Config");

module.exports = {
  // ================================
  // LẤY TẤT CẢ YÊU CẦU
  // ================================
// ================================
// LẤY TẤT CẢ YÊU CẦU CHO ADMIN
// ================================
async getAll(query) {
  const { page = 1, limit = 10, status = "" } = query;

  const filter = {};
  if (status) filter.TrangThai = status;

  const skip = (page - 1) * limit;

  // Lấy danh sách request
  let items = await BorrowRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean(); // ⭐ Quan trọng: tự convert sang object

  // ⭐ LẤY CHI TIẾT SÁCH THEO MaSach
  items = await Promise.all(
    items.map(async (req) => {
      const books = await Book.find({ MaSach: { $in: req.Sach } })
        .populate("MaTacGia")
        .populate("MaNXB")
        .populate("MaTheLoai");

      return {
        ...req,
        Sach: books, // gán sách đầy đủ vào đây
      };
    })
  );

  const total = await BorrowRequest.countDocuments(filter);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
  };
},



  // ================================
  // DUYỆT YÊU CẦU
  // ================================
  async approve(id, employeeId) {
    const req = await BorrowRequest.findById(id);
    if (!req) throw new Error("Không tìm thấy yêu cầu");

    if (req.TrangThai !== "CHO_DUYET")
      throw new Error("Yêu cầu đã được xử lý");

    // Kiểm tra độc giả
    const reader = await Reader.findOne({ MaDocGia: req.MaDocGia });
    if (!reader) throw new Error("Không tìm thấy độc giả");

    // Lấy cấu hình
    const maxBorrow = await getCfg("SO_SACH_MUON_TOI_DA", 5);
    const borrowDays = await getCfg("SO_NGAY_MUON", 30);

    // Số sách đang mượn
    const current = await BorrowRecord.countDocuments({
      MaDocGia: req.MaDocGia,
      TrangThai: { $in: ["Đã mượn", "Trễ hạn"] },
      NgayTra: { $exists: false },
    });

    if (current + req.Sach.length > maxBorrow)
      throw new Error("Độc giả vượt quá số lượng mượn tối đa");

    // Tạo phiếu mượn
    const now = new Date();
    const hanTra = new Date(now.getTime() + borrowDays * 86400000);

    for (const MaSach of req.Sach) {
      const book = await Book.findOne({ MaSach });
      if (!book || book.SoQuyen <= 0)
        throw new Error(`Sách ${MaSach} đã hết hàng`);

      // trừ số lượng
      book.SoQuyen -= 1;
      await book.save();

      await BorrowRecord.create({
        MaDocGia: req.MaDocGia,
        MaSach,
        NgayMuon: now,
        HanTra: hanTra,
        TrangThai: "Đã mượn",
        MSNV: employeeId,
      });
    }

    // Cập nhật trạng thái yêu cầu
    req.TrangThai = "DA_DUYET";
    await req.save();

    return req;
  },

  // ================================
  // TỪ CHỐI YÊU CẦU
  // ================================
  async reject(id, reason) {
    const req = await BorrowRequest.findById(id);
    if (!req) throw new Error("Không tìm thấy yêu cầu");

    if (req.TrangThai !== "CHO_DUYET")
      throw new Error("Yêu cầu đã được xử lý");

    req.TrangThai = "TU_CHOI";
    req.LyDoTuChoi = reason || "Không phù hợp";
    await req.save();

    return req;
  },
};

// ================================
// Helper lấy config
// ================================
async function getCfg(key, def = 0) {
  const c = await Config.findOne({ Ten: key });
  return c ? Number(c.GiaTri) : def;
}
