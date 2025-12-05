// src/services/statistics.service.js
const Book = require("../models/Book");
const Reader = require("../models/Reader");
const BorrowRecord = require("../models/BorrowRecord");

/* =========================
   1) OVERVIEW
   ========================= */
exports.getOverview = async () => {
  const [
    totalBooks,
    totalReaders,
    borrowing,
    overdue
  ] = await Promise.all([
    Book.countDocuments(),
    Reader.countDocuments({ TrangThai: 1 }),
    BorrowRecord.countDocuments({ TrangThai: "Đã mượn" }),
    BorrowRecord.countDocuments({ TrangThai: "Trễ hạn" }),
  ]);

  return {
    totalBooks,
    totalReaders,
    borrowing,
    overdue,
  };
};

/* =========================
   2) TOP 5 BOOKS
   ========================= */
exports.getTopBooks = async () => {
  const agg = await BorrowRecord.aggregate([
    {
      $group: {
        _id: "$MaSach",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const codes = agg.map((a) => a._id);
  const books = await Book.find({ MaSach: { $in: codes } });
  const map = new Map(books.map((b) => [b.MaSach, b]));

  return agg.map((a) => ({
    MaSach: a._id,
    TenSach: map.get(a._id)?.TenSach || a._id,
    count: a.count,
  }));
};

/* =========================
   3) TOP 5 READERS
   ========================= */
exports.getTopReaders = async () => {
  const agg = await BorrowRecord.aggregate([
    {
      $group: {
        _id: "$MaDocGia",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const codes = agg.map((a) => a._id);
  const readers = await Reader.find({ MaDocGia: { $in: codes } });
  const map = new Map(
    readers.map((r) => [
      r.MaDocGia,
      `${r.HoLot || ""} ${r.Ten || ""}`.trim() || r.MaDocGia,
    ])
  );

  return agg.map((a) => ({
    MaDocGia: a._id,
    HoTen: map.get(a._id) || a._id,
    count: a.count,
  }));
};

/* =========================
   4) BORROW / RETURN BY MONTH
   ========================= */
exports.getBorrowReturn = async (yearParam) => {
  const now = new Date();
  const year = yearParam || now.getFullYear();

  const startYear = new Date(year, 0, 1);
  const endYear = new Date(year + 1, 0, 1);

  // Borrow by NgayMuon
  const borrowsAgg = await BorrowRecord.aggregate([
    {
      $match: {
        NgayMuon: { $gte: startYear, $lt: endYear },
      },
    },
    {
      $group: {
        _id: { $month: "$NgayMuon" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Return by NgayTra
  const returnsAgg = await BorrowRecord.aggregate([
    {
      $match: {
        NgayTra: { $gte: startYear, $lt: endYear },
      },
    },
    {
      $group: {
        _id: { $month: "$NgayTra" },
        count: { $sum: 1 },
      },
    },
  ]);

  const borrowArr = Array(12).fill(0);
  const returnArr = Array(12).fill(0);

  borrowsAgg.forEach((b) => {
    borrowArr[b._id - 1] = b.count;
  });

  returnsAgg.forEach((r) => {
    returnArr[r._id - 1] = r.count;
  });

  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

  return {
    year,
    months,
    borrow: borrowArr,
    return: returnArr,
  };
};

/* =========================
   5) FINES (TIỀN PHẠT THÁNG / NĂM)
   ========================= */
exports.getFines = async ({ month, year }) => {
  const now = new Date();
  const m = Number(month) || now.getMonth() + 1; // 1-12
  const y = Number(year) || now.getFullYear();

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  // Lấy các phiếu có TienPhat > 0 trong tháng (theo NgayTra)
  const records = await BorrowRecord.find({
    NgayTra: { $gte: start, $lt: end },
    TienPhat: { $gt: 0 },
  });

  const readerCodes = [...new Set(records.map((r) => r.MaDocGia))];
  const readers = await Reader.find({ MaDocGia: { $in: readerCodes } });

  const readerMap = new Map(
    readers.map((r) => [
      r.MaDocGia,
      `${r.HoLot || ""} ${r.Ten || ""}`.trim() || r.MaDocGia,
    ])
  );

  const rows = records.map((r) => ({
    MaDocGia: r.MaDocGia,
    HoTen: readerMap.get(r.MaDocGia) || r.MaDocGia,
    Loai: r.TrangThai, // Trễ hạn / Hư hỏng / Mất sách / Đã bồi thường
    TienPhat: r.TienPhat || 0,
    NgayTra: r.NgayTra,
  }));

  const totalFine = rows.reduce((sum, r) => sum + r.TienPhat, 0);

  return {
    month: m,
    year: y,
    totalFine,
    records: rows,
  };
};

/* =========================
   6) STATUS DISTRIBUTION (PIE)
   ========================= */
exports.getStatusDistribution = async ({ month, year }) => {
  const now = new Date();
  const m = Number(month) || now.getMonth() + 1;
  const y = Number(year) || now.getFullYear();

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  // Thống kê theo NgayMuon trong tháng đó
  const agg = await BorrowRecord.aggregate([
    {
      $match: {
        NgayMuon: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$TrangThai",
        count: { $sum: 1 },
      },
    },
  ]);

  const labels = [];
  const values = [];

  agg.forEach((a) => {
    labels.push(a._id);
    values.push(a.count);
  });

  return {
    month: m,
    year: y,
    labels,
    values,
  };
};

/* =========================
   6) SÁCH HƯ HỎNG / MẤT
   ========================= */
exports.getDamagedAndLostBooks = async () => {
  // Lấy tất cả phiếu mượn có trạng thái Hư hỏng hoặc Mất sách
  const records = await BorrowRecord.find({
    TrangThai: { $in: ["Hư hỏng", "Mất sách"] }
  }).sort({ createdAt: -1 });

  const bookCodes = [...new Set(records.map(r => r.MaSach))];
  const books = await Book.find({ MaSach: { $in: bookCodes } });
  const readerCodes = [...new Set(records.map(r => r.MaDocGia))];
  const readers = await Reader.find({ MaDocGia: { $in: readerCodes } });

  const bookMap = new Map(books.map(b => [b.MaSach, b]));
  const readerMap = new Map(readers.map(r => [r.MaDocGia, r]));

  // Nhóm theo sách: mỗi sách có bao nhiêu phiếu hư hỏng nhẹ/nặng/mất
  const bookStats = new Map();

  records.forEach(r => {
    const maSach = r.MaSach;
    
    if (!bookStats.has(maSach)) {
      const book = bookMap.get(maSach);
      bookStats.set(maSach, {
        MaSach: maSach,
        TenSach: book?.TenSach || "—",
        lightCount: 0,
        heavyCount: 0,
        lostCount: 0,
        records: { light: [], heavy: [], lost: [] }
      });
    }

    const stat = bookStats.get(maSach);
    const reader = readerMap.get(r.MaDocGia);

    const recordInfo = {
      _id: r._id,
      MaDocGia: r.MaDocGia,
      HoTen: reader ? `${reader.HoLot} ${reader.Ten}`.trim() : "—",
      TienPhat: r.TienPhat || 0,
      NgayTra: r.NgayTra,
    };

    if (r.TrangThai === "Mất sách") {
      stat.lostCount += 1;
      stat.records.lost.push(recordInfo);
    } else if (r.MucDoHuHong === "Nhẹ") {
      stat.lightCount += 1;
      stat.records.light.push(recordInfo);
    } else if (r.MucDoHuHong === "Nặng") {
      stat.heavyCount += 1;
      stat.records.heavy.push(recordInfo);
    }
  });

  const booksArray = Array.from(bookStats.values());

  return {
    books: booksArray,
    total: records.length,
    totalBooks: booksArray.length,
  };
};
