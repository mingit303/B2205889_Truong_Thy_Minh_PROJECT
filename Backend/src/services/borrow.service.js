// src/services/borrow.service.js
const BorrowRecord = require("../models/BorrowRecord");
const Reader = require("../models/Reader");
const Book = require("../models/Book");
const Employee = require("../models/Employee");
const Config = require("../models/Config");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

// Helper lấy cấu hình hệ thống
const getCfg = async (key, def = 0) => {
  const c = await Config.findOne({ Ten: key });
  return c ? Number(c.GiaTri) : def;
};

// Helper tính tiền phạt trễ hạn - mức cố định
const calculateLateFee = async (daysLate) => {
  const baseFine = await getCfg("TIEN_PHAT_MOI_NGAY", 15000);
  return daysLate * baseFine;
};

// ===========================
// 1) LIST (trang Employee)
// ===========================
exports.getBorrowRecords = async (query) => {
  const { page = 1, limit = 10, search = "", status = "" } = query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (status) filter.TrangThai = status;

  if (search) {
    filter.$or = [
      { MaDocGia: new RegExp(search, "i") },
      { MaSach: new RegExp(search, "i") },
    ];
  }

  const records = await BorrowRecord.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await BorrowRecord.countDocuments(filter);

  // Tự populate
  const readers = await Reader.find();
  const books = await Book.find();
  const employees = await Employee.find();

  const mapped = records.map((r) => ({
    ...r.toObject(),
    reader: readers.find((x) => x.MaDocGia === r.MaDocGia) || null,
    book: books.find((x) => x.MaSach === r.MaSach) || null,
    employee: employees.find((x) => x.MSNV === r.MSNV) || null,
  }));

  return {
    records: mapped,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

// ===========================
// 2) LỊCH SỬ MƯỢN (READER UI)
//   req.user.id = MaDocGia
// ===========================
exports.getMyBorrowHistory = async (readerCode, query) => {
  const { page = 1, limit = 10 } = query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const filter = { MaDocGia: readerCode };

  const records = await BorrowRecord.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const books = await Book.find();
  const mapped = records.map((r) => ({
    ...r.toObject(),
    book: books.find((b) => b.MaSach === r.MaSach) || null,
  }));

  const total = await BorrowRecord.countDocuments(filter);

  return {
    records: mapped,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

// ===========================
// 3) TẠO PHIẾU MƯỢN 1 CUỐN
// ===========================
exports.createBorrowRecord = async (data, employeeId) => {
  const { MaDocGia, MaSach } = data;

  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) throw new Error(`Không tìm thấy độc giả: ${MaDocGia}`);

  // Kiểm tra xem độc giả có tiền phạt chưa thanh toán không
  const unpaidFine = await BorrowRecord.findOne({
    MaDocGia,
    TienPhat: { $gt: 0 },
    DaThanhToanPhat: false,
  });
  if (unpaidFine) {
    throw new Error("Độc giả có tiền phạt chưa thanh toán. Vui lòng thanh toán trước khi mượn sách mới.");
  }

  // Kiểm tra xem độc giả đã mượn sách này chưa trả hay chưa
  const alreadyBorrowed = await BorrowRecord.findOne({
    MaDocGia,
    MaSach,
    NgayTra: { $exists: false },
    TrangThai: { $in: ["Đã mượn", "Trễ hạn", "Hư hỏng", "Mất sách"] },
  });
  if (alreadyBorrowed) {
    const book = await Book.findOne({ MaSach }).lean();
    const bookName = book ? book.TenSach : MaSach;
    throw new Error(`Độc giả đã mượn sách "${bookName}" (${MaSach}) và chưa trả. Không thể mượn lại cuốn sách này.`);
  }

  const book = await Book.findOne({ MaSach });
  if (!book) throw new Error(`Không tìm thấy sách: ${MaSach}`);

  if (book.SoQuyen <= 0) throw new Error(`Sách ${MaSach} đã hết`);

  const maxBorrow = await getCfg("SO_SACH_MUON_TOI_DA", 5);
  const borrowDays = await getCfg("SO_NGAY_MUON", 30);

  // Đếm số sách chưa trả (bất kỳ tình trạng: Đã mượn / Trễ hạn / Hư hỏng / Mất sách)
  const currentBorrows = await BorrowRecord.countDocuments({
    MaDocGia,
    TrangThai: { $in: ["Đã mượn", "Trễ hạn", "Hư hỏng", "Mất sách"] },
    NgayTra: { $exists: false },
  });

  if (currentBorrows >= maxBorrow) {
    throw new Error(`Đã đạt số sách mượn tối đa \${maxBorrow} 5 quyển`);
  }

  const now = new Date();
  const hanTra = new Date(now.getTime() + borrowDays * 86400000);
  hanTra.setHours(23, 59, 59, 999); // Set về 23:59:59 của ngày hết hạn

  // Trừ số lượng tồn
  book.SoQuyen -= 1;
  await book.save();

  const record = await BorrowRecord.create({
    MaDocGia,
    MaSach,
    BookRef: book._id,
    NgayMuon: now,
    HanTra: hanTra,
    TrangThai: "Đã mượn",
    MSNV: employeeId,
  });

  return record;
};

// ===========================
// 4) TRẢ SÁCH
// ===========================
exports.returnBook = async (id) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu mượn");

  if (r.NgayTra) {
    throw new Error("Phiếu này đã được xử lý trước đó");
  }

  if (!["Đã mượn", "Trễ hạn"].includes(r.TrangThai)) {
    throw new Error("Chỉ trả sách khi đang ở trạng thái 'Đã mượn' hoặc 'Trễ hạn'");
  }

  const now = new Date();
  let tienPhat = r.TienPhat || 0; // Giữ tiền phạt cũ nếu đã có

  // Nếu chưa có tiền phạt và bây giờ trả trễ → tính tiền phạt
  if (tienPhat === 0 && now > r.HanTra) {
    // So sánh ngày không tính giờ phút giây
    const hanTraDate = new Date(r.HanTra);
    hanTraDate.setHours(0, 0, 0, 0);
    const nowDate = new Date(now);
    nowDate.setHours(0, 0, 0, 0);
    
    const daysLate = Math.floor((nowDate - hanTraDate) / 86400000);
    
    // Tính tiền phạt cố định 5k/ngày
    tienPhat = await calculateLateFee(daysLate);
    
    r.TienPhat = tienPhat;
    r.LyDoXuPhat = "Trễ hạn";
    // KHÔNG tăng SoLanTreHan vì mỗi phiếu chỉ trả 1 lần
  }
  
  // Luôn chuyển về "Đã trả" khi trả sách (dù có phạt hay không)
  r.TrangThai = "Đã trả";
  r.NgayTra = now;

  // Trả sách bình thường => nhập lại kho
  const book = await Book.findOne({ MaSach: r.MaSach });
  if (book) {
    book.SoQuyen += 1;
    await book.save();
    
    // Emit socket event để cập nhật số lượng sách realtime
    emitSocketEvent(SOCKET_EVENTS.BOOK_UPDATED, {
      MaSach: book.MaSach,
      SoQuyen: book.SoQuyen,
    });
  }

  await r.save();
  
  // Emit event cập nhật phiếu mượn
  emitSocketEvent(SOCKET_EVENTS.BORROW_UPDATED, r);
  
  return r;
};

// ===========================
// 5) GIA HẠN
// ===========================
exports.extendBorrow = async (id) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu mượn");

  if (!["Đã mượn", "Trễ hạn"].includes(r.TrangThai)) {
    throw new Error("Chỉ gia hạn khi phiếu đang 'Đã mượn' hoặc 'Trễ hạn'");
  }

  const maxExtend = await getCfg("SO_LAN_GIA_HAN_TOI_DA", 2);
  const extendDays = await getCfg("SO_NGAY_GIA_HAN", 7);

  if (r.SoLanGiaHan >= maxExtend) {
    throw new Error(`Đã đạt số lần gia hạn tối đa ${maxExtend} lần`);
  }

  // Gia hạn: chỉ tăng số lần gia hạn và cập nhật hạn trả
  // KHÔNG tính phạt trễ tại đây - phạt sẽ tính khi trả sách
  r.SoLanGiaHan += 1;
  r.TrangThai = "Đã mượn"; // Chuyển về trạng thái bình thường sau khi gia hạn
  
  // Gia hạn thêm số ngày và set về 23:59:59 của ngày hết hạn mới
  const now = new Date();
  const newDeadline = new Date(r.HanTra.getTime() + extendDays * 86400000);
  newDeadline.setHours(23, 59, 59, 999);
  r.HanTra = newDeadline;

  await r.save();
  
  // Emit socket event để cập nhật realtime
  emitSocketEvent(SOCKET_EVENTS.BORROW_UPDATED, r);
  
  return r;
};

// ===========================
// 6) BÁO HƯ HỎNG
// ===========================
exports.reportDamaged = async (id, data) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu mượn");

  if (r.NgayTra) {
    throw new Error("Phiếu này đã được trả, không thể báo hư hỏng");
  }

  const book = await Book.findOne({ MaSach: r.MaSach });
  if (!book) throw new Error("Không tìm thấy sách");

  const light = await getCfg("TY_LE_PHAT_HU_HONG_NHE", 30);
  const heavy = await getCfg("TY_LE_PHAT_HU_HONG_NANG", 70);

  r.MucDoHuHong = data.MucDoHuHong;
  
  // Tính tiền phạt trễ hạn (nếu quá hạn)
  const now = new Date();
  let lateFine = 0;
  if (now > r.HanTra) {
    // So sánh ngày không tính giờ phút giây
    const hanTraDate = new Date(r.HanTra);
    hanTraDate.setHours(0, 0, 0, 0);
    const nowDate = new Date(now);
    nowDate.setHours(0, 0, 0, 0);
    
    const daysLate = Math.floor((nowDate - hanTraDate) / 86400000);
    
    // Tính tiền phạt cố định 5k/ngày - CHỈ 1 LẦN
    lateFine = await calculateLateFee(daysLate);
  }
  
  // Tính tiền phạt hư hỏng
  const perc = data.MucDoHuHong === "Nhẹ" ? light : heavy;
  const damagePrice = Math.round((book.DonGia * perc) / 100);
  
  // CỘNG: tiền phạt trễ hạn + tiền phạt hư hỏng (chỉ tính 1 lần)
  r.TienPhat = lateFine + damagePrice;
  
  // Cập nhật lý do xử phạt
  if (lateFine > 0) {
    r.LyDoXuPhat = `Trễ hạn + Sách hư hỏng (${data.MucDoHuHong})`;
  } else {
    r.LyDoXuPhat = data.LyDoXuPhat || `Sách hư hỏng (${data.MucDoHuHong})`;
  }

  r.TrangThai = "Hư hỏng";
  r.NgayTra = new Date(); // xử lý xong

  // sách hư hỏng => không cộng lại SoQuyen
  await r.save();
  
  // Emit event cập nhật phiếu mượn
  emitSocketEvent(SOCKET_EVENTS.BORROW_UPDATED, r);
  
  return r;
};

// ===========================
// 7) BÁO MẤT SÁCH
// ===========================
exports.reportLost = async (id, data) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu mượn");

  if (r.NgayTra) {
    throw new Error("Phiếu này đã được trả, không thể báo mất sách");
  }

  const book = await Book.findOne({ MaSach: r.MaSach });
  if (!book) throw new Error("Không tìm thấy sách");

  const lostRate = await getCfg("TY_LE_PHAT_MAT_SACH", 100);
  const fee = await getCfg("PHI_XU_LY_MAT_SACH", 50000);

  r.MucDoHuHong = "Mất";
  
  // Tính tiền phạt trễ hạn (nếu quá hạn)
  const now = new Date();
  let lateFine = 0;
  if (now > r.HanTra) {
    // So sánh ngày không tính giờ phút giây
    const hanTraDate = new Date(r.HanTra);
    hanTraDate.setHours(0, 0, 0, 0);
    const nowDate = new Date(now);
    nowDate.setHours(0, 0, 0, 0);
    
    const daysLate = Math.floor((nowDate - hanTraDate) / 86400000);
    
    // Tính tiền phạt cố định 5k/ngày - CHỈ 1 LẦN
    lateFine = await calculateLateFee(daysLate);
  }
  
  // Tính tiền phạt mất sách
  const lostPrice = Math.round((book.DonGia * lostRate) / 100) + fee;
  
  // CỘNG: tiền phạt trễ hạn + tiền phạt mất sách (chỉ tính 1 lần)
  r.TienPhat = lateFine + lostPrice;
  
  // Cập nhật lý do xử phạt
  if (lateFine > 0) {
    r.LyDoXuPhat = "Trễ hạn + Mất sách";
  } else {
    r.LyDoXuPhat = data.LyDoXuPhat || "Mất sách";
  }
  
  r.TrangThai = "Mất sách";
  r.NgayTra = new Date();

  // Sách mất => đã trừ tồn khi mượn, không cộng lại
  await r.save();
  
  // Emit event cập nhật phiếu mượn
  emitSocketEvent(SOCKET_EVENTS.BORROW_UPDATED, r);
  
  return r;
};

// ===========================
// 8) XÁC NHẬN THANH TOÁN (cho hư hỏng/mất sách)
// ===========================
exports.markPaid = async (id) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu");

  if (!["Hư hỏng", "Mất sách"].includes(r.TrangThai))
    throw new Error("Phiếu không ở trạng thái hư hỏng hoặc mất sách");

  // Chỉ đánh dấu đã thanh toán, không thay đổi TrangThai
  r.DaThanhToanPhat = true;

  await r.save();
  return r;
};

// ===========================
// 9) XÁC NHẬN ĐÃ THANH TOÁN TIỀN PHẠT
// ===========================
exports.confirmFinePaid = async (id) => {
  const r = await BorrowRecord.findById(id);
  if (!r) throw new Error("Không tìm thấy phiếu");

  if (!r.TienPhat || r.TienPhat === 0) {
    throw new Error("Phiếu này không có tiền phạt");
  }

  r.DaThanhToanPhat = true;
  await r.save();
  return r;
};

// ===========================
// 10) DANH SÁCH QUÁ HẠN
// ===========================
exports.getOverdueRecords = async () => {
  const now = new Date();

  const records = await BorrowRecord.find({
    TrangThai: "Đã mượn",
    HanTra: { $lt: now },
  });

  const readers = await Reader.find();
  const books = await Book.find();

  return records.map((r) => ({
    ...r.toObject(),
    reader: readers.find((x) => x.MaDocGia === r.MaDocGia) || null,
    book: books.find((x) => x.MaSach === r.MaSach) || null,
  }));
};
