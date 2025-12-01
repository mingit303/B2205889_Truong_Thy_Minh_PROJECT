// // src/controllers/pdf.controller.js
// const PDFDocument = require("pdfkit");
// const path = require("path");
// const BorrowRecord = require("../models/BorrowRecord");
// const Reader = require("../models/Reader");
// const Book = require("../models/Book");
// const Employee = require("../models/Employee");

// const fontRegular = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
// const fontBold = path.join(__dirname, "../fonts/Roboto-Bold.ttf");

// /* ==========================================================
//    PHIẾU MƯỢN
// ========================================================== */
// exports.printBorrowTicket = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const br = await BorrowRecord.findById(id);
//     if (!br) return res.status(404).send("Không tìm thấy phiếu mượn");

//     const reader = await Reader.findOne({ MaDocGia: br.MaDocGia });
//     const book = await Book.findOne({ MaSach: br.MaSach });
//     const emp = await Employee.findOne({ MSNV: br.MSNV });

//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 40,
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     doc.pipe(res);

//     doc.font(fontBold).fontSize(20).text("PHIẾU MƯỢN SÁCH", { align: "center" });
//     doc.moveDown();

//     doc.font(fontBold).fontSize(12).text("Thông tin độc giả:");
//     doc.font(fontRegular).fontSize(12);
//     doc.text(`Mã độc giả: ${reader?.MaDocGia || ""}`);
//     doc.text(`Tên độc giả: ${reader ? `${reader.HoLot} ${reader.Ten}` : ""}`);
//     doc.text(`SĐT: ${reader?.DienThoai || ""}`);
//     doc.moveDown();

//     doc.font(fontBold).text("Thông tin sách:");
//     doc.font(fontRegular);
//     doc.text(`Mã sách: ${book?.MaSach || ""}`);
//     doc.text(`Tên sách: ${book?.TenSach || ""}`);
//     if (book?.DonGia != null) {
//       doc.text(`Đơn giá: ${book.DonGia.toLocaleString("vi-VN")} đ`);
//     }
//     doc.moveDown();

//     doc.font(fontBold).text("Thông tin mượn:");
//     doc.font(fontRegular);
//     doc.text(`Ngày mượn: ${br.NgayMuon.toLocaleDateString("vi-VN")}`);
//     doc.text(`Hạn trả: ${br.HanTra.toLocaleDateString("vi-VN")}`);
//     doc.text(`Trạng thái: ${br.TrangThai}`);
//     doc.moveDown();

//     doc.font(fontBold).text("Nhân viên xử lý:");
//     doc.font(fontRegular);
//     doc.text(
//       `MSNV: ${emp?.MSNV || br.MSNV} - ${emp?.HoTenNV || "Không rõ"}`
//     );
//     doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

//     doc.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi tạo PDF");
//   }
// };

// /* ==========================================================
//    PHIẾU PHẠT
// ========================================================== */
// exports.printFineTicket = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const br = await BorrowRecord.findById(id);
//     if (!br) return res.status(404).send("Không tìm thấy phiếu phạt");

//     if (!br.TienPhat || br.TienPhat <= 0) {
//       return res.status(400).send("Phiếu này không có tiền phạt");
//     }

//     const reader = await Reader.findOne({ MaDocGia: br.MaDocGia });
//     const book = await Book.findOne({ MaSach: br.MaSach });
//     const emp = await Employee.findOne({ MSNV: br.MSNV });

//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 40,
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     doc.pipe(res);

//     doc.font(fontBold).fontSize(20).text("PHIẾU PHẠT", { align: "center" });
//     doc.moveDown();

//     doc.font(fontBold).fontSize(12).text("Thông tin độc giả:");
//     doc.font(fontRegular);
//     doc.text(`Mã độc giả: ${reader?.MaDocGia || ""}`);
//     doc.text(`Tên độc giả: ${reader ? `${reader.HoLot} ${reader.Ten}` : ""}`);
//     doc.moveDown();

//     doc.font(fontBold).text("Thông tin sách:");
//     doc.font(fontRegular);
//     doc.text(`Mã sách: ${book?.MaSach || ""}`);
//     doc.text(`Tên sách: ${book?.TenSach || ""}`);
//     doc.moveDown();

//     doc.font(fontBold).text("Thông tin xử phạt:");
//     doc.font(fontRegular);
//     doc.text(`Lý do: ${br.LyDoXuPhat || ""}`);
//     doc.text(`Trạng thái: ${br.TrangThai}`);
//     doc.text(`Tiền phạt: ${br.TienPhat.toLocaleString("vi-VN")} đ`);
//     doc.moveDown();

//     doc.font(fontBold).text("Nhân viên xử lý:");
//     doc.font(fontRegular);
//     doc.text(
//       `MSNV: ${emp?.MSNV || br.MSNV} - ${emp?.HoTenNV || "Không rõ"}`
//     );
//     doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

//     doc.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi tạo PDF");
//   }
// };


// src/controllers/pdf.controller.js
const PDFDocument = require("pdfkit");
const path = require("path");

const BorrowRecord = require("../models/BorrowRecord");
const Reader = require("../models/Reader");
const Book = require("../models/Book");
const Employee = require("../models/Employee");

const fontRegular = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
const fontBold = path.join(__dirname, "../fonts/Roboto-Bold.ttf");

// Helper – format date
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "";

const line = (doc) => {
  doc.moveDown(0.3);
  doc.strokeColor("#cccccc").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();
};

/* ==========================================================
   PHIẾU MƯỢN
========================================================== */
exports.printBorrowTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const br = await BorrowRecord.findById(id);
    if (!br) return res.status(404).send("Không tìm thấy phiếu mượn");

    const reader = await Reader.findOne({ MaDocGia: br.MaDocGia }) || {};
    const book = await Book.findOne({ MaSach: br.MaSach }) || {};
    const emp = await Employee.findOne({ MSNV: br.MSNV }) || {};

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    /* HEADER */
    doc.font(fontBold).fontSize(22).text("PHIẾU MƯỢN SÁCH", { align: "center" });
    line(doc);

    /* THÔNG TIN ĐỘC GIẢ */
    doc.font(fontBold).fontSize(14).text("1. Thông tin độc giả");
    doc.font(fontRegular).fontSize(12);
    doc.text(`• Mã độc giả: ${reader.MaDocGia || "—"}`);
    doc.text(`• Họ tên: ${reader.HoLot || ""} ${reader.Ten || ""}`);
    doc.text(`• SĐT: ${reader.DienThoai || "—"}`);
    line(doc);

    /* THÔNG TIN SÁCH */
    doc.font(fontBold).fontSize(14).text("2. Thông tin sách");
    doc.font(fontRegular);
    doc.text(`• Mã sách: ${book.MaSach || "—"}`);
    doc.text(`• Tên sách: ${book.TenSach || "—"}`);
    if (book.DonGia != null)
      doc.text(`• Đơn giá: ${book.DonGia.toLocaleString("vi-VN")} đ`);
    line(doc);

    /* THÔNG TIN MƯỢN */
    doc.font(fontBold).fontSize(14).text("3. Thông tin mượn");
    doc.font(fontRegular);
    doc.text(`• Ngày mượn: ${formatDate(br.NgayMuon)}`);
    doc.text(`• Hạn trả: ${formatDate(br.HanTra)}`);
    doc.text(`• Trạng thái: ${br.TrangThai}`);
    line(doc);

    /* NHÂN VIÊN */
    doc.font(fontBold).fontSize(14).text("4. Nhân viên xử lý");
    doc.font(fontRegular);
    doc.text(`• MSNV: ${emp.MSNV || br.MSNV}`);
    doc.text(`• Họ tên: ${emp.HoTenNV || "—"}`);
    doc.text(`• Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi tạo PDF phiếu mượn");
  }
};


/* ==========================================================
   PHIẾU PHẠT
========================================================== */
exports.printFineTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const br = await BorrowRecord.findById(id);
    if (!br) return res.status(404).send("Không tìm thấy phiếu phạt");

    if (!br.TienPhat || br.TienPhat <= 0) {
      return res.status(400).send("Phiếu này không có tiền phạt");
    }

    const reader = await Reader.findOne({ MaDocGia: br.MaDocGia }) || {};
    const book = await Book.findOne({ MaSach: br.MaSach }) || {};
    const emp = await Employee.findOne({ MSNV: br.MSNV }) || {};

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    /* HEADER */
    doc.font(fontBold).fontSize(22).text("PHIẾU PHẠT", { align: "center" });
    line(doc);

    /* ĐỘC GIẢ */
    doc.font(fontBold).fontSize(14).text("1. Thông tin độc giả");
    doc.font(fontRegular);
    doc.text(`• Mã độc giả: ${reader.MaDocGia || "—"}`);
    doc.text(`• Họ tên: ${reader.HoLot || ""} ${reader.Ten || ""}`);
    line(doc);

    /* SÁCH */
    doc.font(fontBold).fontSize(14).text("2. Thông tin sách");
    doc.font(fontRegular);
    doc.text(`• Mã sách: ${book.MaSach || "—"}`);
    doc.text(`• Tên sách: ${book.TenSach || "—"}`);
    line(doc);

    /* XỬ PHẠT */
    doc.font(fontBold).fontSize(14).text("3. Thông tin xử phạt");
    doc.font(fontRegular);
    doc.text(`• Lý do: ${br.LyDoXuPhat || "—"}`);
    doc.text(`• Trạng thái: ${br.TrangThai}`);
    doc.text(`• Số tiền: ${br.TienPhat.toLocaleString("vi-VN")} đ`);
    line(doc);

    /* NHÂN VIÊN */
    doc.font(fontBold).fontSize(14).text("4. Nhân viên xử lý");
    doc.font(fontRegular);
    doc.text(`• MSNV: ${emp.MSNV || br.MSNV}`);
    doc.text(`• Họ tên: ${emp.HoTenNV || "—"}`);
    doc.text(`• Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi tạo PDF phiếu phạt");
  }
};

/* ==========================================================
   THỐNG KÊ: OVERVIEW
========================================================== */
const statisticsService = require("../services/statistics.service");

exports.printOverviewStatistics = async (req, res) => {
  try {
    const data = await statisticsService.getOverview();

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font(fontBold).fontSize(20).text("THỐNG KÊ TỔNG QUAN", { align: "center" });
    doc.moveDown();

    doc.font(fontRegular).fontSize(13);
    doc.text(`Tổng số sách: ${data.totalBooks}`);
    doc.text(`Độc giả đang hoạt động: ${data.totalReaders}`);
    doc.text(`Sách đang mượn: ${data.borrowing}`);
    doc.text(`Sách quá hạn: ${data.overdue}`);

    doc.moveDown(2);
    doc.font(fontRegular).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi xuất PDF thống kê tổng quan");
  }
};


/* ==========================================================
   THỐNG KÊ: TOP BOOKS & TOP READERS
========================================================== */
exports.printTopStatistics = async (req, res) => {
  try {
    const books = await statisticsService.getTopBooks();
    const readers = await statisticsService.getTopReaders();

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font(fontBold).fontSize(20).text("THỐNG KÊ TOP SÁCH & ĐỘC GIẢ", { align: "center" });
    doc.moveDown();

    // TOP BOOKS
    doc.font(fontBold).fontSize(14).text("Top 5 Sách Được Mượn Nhiều Nhất:");
    doc.font(fontRegular);

    books.forEach((b, i) => {
      doc.text(`${i + 1}. ${b.TenSach} — ${b.count} lượt`);
    });

    doc.moveDown();

    // TOP READERS
    doc.font(fontBold).fontSize(14).text("Top 5 Độc Giả Mượn Nhiều Nhất:");
    doc.font(fontRegular);

    readers.forEach((r, i) => {
      doc.text(`${i + 1}. ${r.HoTen} — ${r.count} lượt`);
    });

    doc.moveDown(2);
    doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    res.status(500).send("Lỗi xuất PDF thống kê top");
  }
};


/* ==========================================================
   THỐNG KÊ: MƯỢN / TRẢ THEO THÁNG
========================================================== */
exports.printBorrowReturnStatistics = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const d = await statisticsService.getBorrowReturn(year);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font(fontBold).fontSize(20).text(`THỐNG KÊ MƯỢN / TRẢ NĂM ${d.year}`, { align: "center" });
    doc.moveDown();

    doc.font(fontBold).fontSize(13).text("Lượt mượn:");
    doc.font(fontRegular);
    d.months.forEach((m, i) => {
      doc.text(`Tháng ${m}: ${d.borrow[i]} lượt`);
    });

    doc.moveDown();

    doc.font(fontBold).fontSize(13).text("Lượt trả:");
    doc.font(fontRegular);
    d.months.forEach((m, i) => {
      doc.text(`Tháng ${m}: ${d.return[i]} lượt`);
    });

    doc.moveDown(2);
    doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    res.status(500).send("Lỗi xuất PDF thống kê mượn / trả");
  }
};


/* ==========================================================
   THỐNG KÊ: TRẠNG THÁI (PIE CHART – TEXT)
========================================================== */
exports.printStatusStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const d = await statisticsService.getStatusDistribution({ month, year });

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font(fontBold).fontSize(20).text("THỐNG KÊ TRẠNG THÁI PHIẾU MƯỢN", { align: "center" });
    doc.moveDown();

    doc.font(fontRegular).fontSize(13);
    doc.text(`Tháng ${d.month}/${d.year}`);
    doc.moveDown();

    d.labels.forEach((label, i) => {
      doc.text(`${label}: ${d.values[i]} lượt`);
    });

    doc.moveDown(2);
    doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    res.status(500).send("Lỗi xuất PDF trạng thái");
  }
};


/* ==========================================================
   THỐNG KÊ: TIỀN PHẠT
========================================================== */
exports.printFinesStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const d = await statisticsService.getFines({ month, year });

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font(fontBold).fontSize(20).text("THỐNG KÊ TIỀN PHẠT", { align: "center" });
    doc.moveDown();

    doc.font(fontRegular).fontSize(13);
    doc.text(`Tháng ${d.month}/${d.year}`);
    doc.text(`Tổng tiền phạt: ${d.totalFine.toLocaleString("vi-VN")} đ`);
    doc.moveDown();

    d.records.forEach((r, i) => {
      doc.text(
        `${i + 1}. ${r.HoTen} — ${r.Loai} — ${r.TienPhat.toLocaleString("vi-VN")} đ`
      );
    });

    doc.moveDown(2);
    doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}`);

    doc.end();
  } catch (err) {
    res.status(500).send("Lỗi xuất PDF tiền phạt");
  }
};
