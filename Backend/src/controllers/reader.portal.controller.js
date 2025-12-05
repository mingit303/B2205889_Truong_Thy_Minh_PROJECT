const Reader = require("../models/Reader");
const Book = require("../models/Book");
const BorrowRecord = require("../models/BorrowRecord");
const BorrowRequest = require("../models/BorrowRequest");
const borrowService = require("../services/borrow.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

// ===============================
// Helper: tạo token
// ===============================
const signToken = (reader) => {
  return jwt.sign(
    {
      id: reader.MaDocGia,
      email: reader.Email,
      role: "reader",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ===============================
// AUTH
// ===============================
exports.register = async (req, res) => {
  try {
    const { MaDocGia, Email, MatKhau, Ten } = req.body;

    if (!MaDocGia || !Email || !MatKhau || !Ten)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const exists = await Reader.findOne({ $or: [{ MaDocGia }, { Email }] });
    if (exists) return res.status(400).json({ message: "Mã hoặc email đã tồn tại" });

    const hash = await bcrypt.hash(MatKhau, 10);

    const created = await Reader.create({
      ...req.body,
      MatKhau: hash,
    });

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { MaDocGia, Email, MatKhau } = req.body;

    const reader = await Reader.findOne({
      $or: [{ MaDocGia }, { Email }],
    });

    if (!reader) return res.status(400).json({ message: "Tài khoản không tồn tại" });

    const ok = await bcrypt.compare(MatKhau, reader.MatKhau);
    if (!ok) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = signToken(reader);

    res.json({
      message: "Đăng nhập thành công",
      token,
      reader: {
        MaDocGia: reader.MaDocGia,
        HoLot: reader.HoLot,
        Ten: reader.Ten,
        Email: reader.Email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// PROFILE
// ===============================
exports.getProfile = async (req, res) => {
  const r = await Reader.findOne({ MaDocGia: req.user.id }).select("-MatKhau");
  res.json({ data: r });
};

exports.updateProfile = async (req, res) => {
  const r = await Reader.findOne({ MaDocGia: req.user.id });

  if (!r) return res.status(404).json({ message: "Không tìm thấy độc giả" });

  const fields = ["HoLot", "Ten", "NgaySinh", "Phai", "DiaChi", "DienThoai", "Email"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) r[f] = req.body[f];
  });

  await r.save();
  res.json({ message: "Cập nhật thành công" });
};

exports.changePassword = async (req, res) => {
  const { oldPass, newPass } = req.body;

  const r = await Reader.findOne({ MaDocGia: req.user.id });
  if (!r) return res.status(404).json({ message: "Không tìm thấy độc giả" });

  const ok = await bcrypt.compare(oldPass, r.MatKhau);
  if (!ok) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

  r.MatKhau = await bcrypt.hash(newPass, 10);
  await r.save();

  res.json({ message: "Đổi mật khẩu thành công" });
};

// ===============================
// BOOK LIST
// ===============================
// ===============================
// BOOK LIST (có search + status + phân trang)
// ===============================
// ===============================
// BOOK LIST (Reader portal - có populate đầy đủ)
// ===============================
// ===============================
// BOOK LIST (Reader portal - FULL FILTER + POPULATE)
// ===============================
exports.getBooks = async (req, res) => {
  try {
    const {
      keyword = "",
      status = "",
      page = 1,
      limit = 12,
      authorId = "",
      publisherId = "",
      categoryId = "",
    } = req.query;

    const filter = {};

    // SEARCH
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { TenSach: regex },
        { MaSach: regex },
      ];
    }

    // STATUS
    if (status === "available") filter.SoQuyen = { $gt: 0 };
    if (status === "out") filter.SoQuyen = { $lte: 0 };

    // 🔥 FILTER 3 LOẠI
    if (authorId) filter.MaTacGia = authorId;
    if (publisherId) filter.MaNXB = publisherId;
    if (categoryId) filter.MaTheLoai = categoryId;

    // PAGINATION
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // QUERY
    const [items, total] = await Promise.all([
      Book.find(filter)
        .populate("MaTacGia")
        .populate("MaTheLoai")
        .populate("MaNXB")
        .skip(skip)
        .limit(limitNum),

      Book.countDocuments(filter),
    ]);

    return paginate(res, items, pageNum, limitNum, total, "Lấy danh sách sách thành công");

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// ===============================
// CART
// ===============================

// ===============================
// CART (đã FIX — trả về danh sách sách đầy đủ)
// ===============================
exports.getCart = async (req, res) => {
  const reader = await Reader.findOne({ MaDocGia: req.user.id });

  const ids = reader.Cart || [];

  // Lấy thông tin sách đầy đủ
  const books = await Book.find({ MaSach: { $in: ids } })
    .populate("MaTacGia")
    .populate("MaTheLoai")
    .populate("MaNXB");

  res.json({ data: books });
};

// Thêm sách vào giỏ
exports.addToCart = async (req, res) => {
  const reader = await Reader.findOne({ MaDocGia: req.user.id });

  if (!reader.Cart) reader.Cart = [];

  if (reader.Cart.includes(req.body.MaSach))
    return res.status(400).json({ message: "Sách đã có trong giỏ" });

  reader.Cart.push(req.body.MaSach);
  await reader.save();

  const books = await Book.find({ MaSach: { $in: reader.Cart } })
    .populate("MaTacGia")
    .populate("MaTheLoai")
    .populate("MaNXB");

  res.json({ message: "Đã thêm", data: books });
};

// Xóa 1 sách
exports.removeFromCart = async (req, res) => {
  const reader = await Reader.findOne({ MaDocGia: req.user.id });

  reader.Cart = reader.Cart.filter((id) => id !== req.params.id);
  await reader.save();

  const books = await Book.find({ MaSach: { $in: reader.Cart } })
    .populate("MaTacGia")
    .populate("MaTheLoai")
    .populate("MaNXB");

  res.json({ message: "Đã xóa", data: books });
};

// Xóa toàn bộ
exports.clearCart = async (req, res) => {
  const reader = await Reader.findOne({ MaDocGia: req.user.id });

  reader.Cart = [];
  await reader.save();

  res.json({ message: "Đã làm sạch giỏ", data: [] });
};


// ===============================
// BORROW REQUEST
// ===============================
exports.createBorrowRequest = async (req, res) => {
  const r = await BorrowRequest.create({
    MaDocGia: req.user.id,
    Sach: req.body.Sach,
    GhiChu: req.body.GhiChu || "",
    // TrangThai: "Chờ duyệt",
    TrangThai: "CHO_DUYET", // ✅ dùng chung với FE
  });

  // Emit socket event để employee nhận real-time
  emitSocketEvent(SOCKET_EVENTS.REQUEST_CREATED, r);

  res.json({ message: "Gửi yêu cầu thành công", data: r });
};


exports.getMyRequests = async (req, res) => {
  try {
    let items = await BorrowRequest.find({ MaDocGia: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 Lấy thông tin sách
    for (let r of items) {
      r.Sach = await Book.find({ MaSach: { $in: r.Sach } })
        .populate("MaTacGia")
        .populate("MaNXB")
        .populate("MaTheLoai")
        .lean();
    }

    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// BORROW HISTORY
// ===============================
exports.getMyBorrowHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const filter = { MaDocGia: req.user.id };
    if (status) filter.TrangThai = status;

    // Lấy danh sách phiếu mượn có phân trang + lọc
    let list = await BorrowRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Đếm tổng để phân trang
    const total = await BorrowRecord.countDocuments(filter);

    // Lấy chi tiết Book theo MaSach (METHOD CŨ — CÓ HÌNH BÌA)
    for (let r of list) {
      r.Book = await Book.findOne({ MaSach: r.MaSach })
        .populate("MaTacGia")
        .populate("MaTheLoai")
        .populate("MaNXB")
        .lean();
    }

    return paginate(res, list, page, limit, total, "Lấy lịch sử mượn sách thành công");

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GIA HẠN MƯỢN SÁCH
// ===============================
exports.extendMyBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const readerCode = req.user.id;

    // Kiểm tra phiếu mượn có thuộc về độc giả này không
    const record = await BorrowRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (record.MaDocGia !== readerCode) {
      return res.status(403).json({ message: "Bạn không có quyền gia hạn phiếu mượn này" });
    }

    // Gọi service để gia hạn
    const updated = await borrowService.extendBorrow(id);

    res.json({
      message: "Gia hạn thành công",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







