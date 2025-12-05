// src/controllers/pdf.controller.js
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const BorrowRecord = require("../models/BorrowRecord");
const Reader = require("../models/Reader");
const Book = require("../models/Book");
const Employee = require("../models/Employee");

const fontRegular = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
const fontBold = path.join(__dirname, "../fonts/Roboto-Bold.ttf");
const logoPath = path.join(__dirname, "../assets/backend_logo.png");

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
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).fillColor("#000000").text("PHIẾU MƯỢN SÁCH", { align: "center" });
    // doc.moveDown();
    doc.fontSize(10).fillColor("#666666").text(`Mã phiếu: ${br._id}`, { align: "center" });
    doc.moveDown(1.5);

    /* THÔNG TIN ĐỘC GIẢ - TABLE */
    doc.fillColor("#000000");
    let tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("THÔNG TIN ĐỘC GIẢ", 40, tableTop + 7, { width: 515, align: "center" });
    
    tableTop += 25;
    
    // Rows
    const readerData = [
      ["Mã độc giả", reader.MaDocGia || "—"],
      ["Họ tên", `${reader.HoLot || ""} ${reader.Ten || ""}`],
      ["Điện thoại", reader.DienThoai || "—"],
      ["Email", reader.Email || "—"]
    ];
    
    readerData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(11);
      doc.text(row[0], 50, tableTop + 7, { width: 150, align: "left" });
      
      doc.font(fontRegular);
      doc.text(row[1], 210, tableTop + 7, { width: 335, align: "left" });
      
      tableTop += 25;
    });
    
    doc.moveDown(1);

    /* THÔNG TIN SÁCH - TABLE */
    tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("THÔNG TIN SÁCH", 40, tableTop + 7, { width: 515, align: "center" });
    
    tableTop += 25;
    
    // Rows
    const bookData = [
      ["Mã sách", book.MaSach || "—"],
      ["Tên sách", book.TenSach || "—"],
      ["Đơn giá", book.DonGia ? `${book.DonGia.toLocaleString("vi-VN")} đ` : "—"]
    ];
    
    bookData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(11);
      doc.text(row[0], 50, tableTop + 7, { width: 150, align: "left" });
      
      doc.font(fontRegular);
      doc.text(row[1], 210, tableTop + 7, { width: 335, align: "left" });
      
      tableTop += 25;
    });
    
    doc.moveDown(1);

    /* THÔNG TIN MƯỢN - TABLE */
    tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("THÔNG TIN MƯỢN", 40, tableTop + 7, { width: 515, align: "center" });
    
    tableTop += 25;
    
    // Rows
    const borrowData = [
      ["Ngày mượn", formatDate(br.NgayMuon)],
      ["Hạn trả", formatDate(br.HanTra)],
      ["Ngày trả", br.NgayTra ? formatDate(br.NgayTra) : "Chưa trả"],
      ["Trạng thái", br.TrangThai]
    ];
    
    borrowData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(11);
      doc.text(row[0], 50, tableTop + 7, { width: 150, align: "left" });
      
      doc.font(fontRegular);
      doc.text(row[1], 210, tableTop + 7, { width: 335, align: "left" });
      
      tableTop += 25;
    });
    
    doc.moveDown(0.5);

    // /* CHI TIẾT TIỀN PHẠT - TABLE (only if there's a fine) */
    // if (br.TienPhat && br.TienPhat > 0) {
    //   tableTop = doc.y;
      
    //   // Header
    //   doc.rect(40, tableTop, 515, 25).fillAndStroke("#d32f2f", "#d32f2f");
    //   doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    //   doc.text("CHI TIẾT TIỀN PHẠT", 40, tableTop + 7, { width: 515, align: "center" });
      
    //   tableTop += 25;
      
    //   // Lấy thông tin sách để tính chính xác giá phạt hư hỏng/mất
    //   const bookInfo = await Book.findOne({ MaSach: br.MaSach });
    //   const bookPrice = bookInfo ? bookInfo.DonGia : 0;
      
    //   // Calculate fine breakdown - ĐÚNG THEO LOGIC SERVICE
    //   let daysLate = 0;
    //   let lateFine = 0;
    //   let damageFine = 0;
    //   let fineRate = 5000; // Mức phạt mặc định
      
    //   // Tính số ngày trễ (giống service: so sánh ngày không tính giờ)
    //   if (br.NgayTra && br.HanTra) {
    //     const hanTraDate = new Date(br.HanTra);
    //     hanTraDate.setHours(0, 0, 0, 0);
    //     const ngayTraDate = new Date(br.NgayTra);
    //     ngayTraDate.setHours(0, 0, 0, 0);
        
    //     if (ngayTraDate > hanTraDate) {
    //       daysLate = Math.floor((ngayTraDate - hanTraDate) / 86400000); // Dùng floor như service
          
    //       // Tính fine rate theo SỐ LẦN GIA HẠN
    //       if (br.SoLanGiaHan === 1) {
    //         fineRate = 15000; // Sau gia hạn lần 1
    //       } else if (br.SoLanGiaHan >= 2) {
    //         fineRate = 30000; // Sau gia hạn lần 2
    //       }
    //       lateFine = daysLate * fineRate;
    //     }
    //   }
      
    //   // Tính phạt hư hỏng/mất (phần còn lại sau khi trừ phạt trễ)
    //   if (["Hư hỏng", "Mất sách"].includes(br.TrangThai)) {
    //     damageFine = br.TienPhat - lateFine;
    //   }
      
    //   // Rows - hiển thị đầy đủ chi tiết
    //   const fineData = [];
      
    //   // 1. Lý do xử phạt (nếu có)
    //   if (br.LyDoXuPhat) {
    //     fineData.push(["Lý do xử phạt", br.LyDoXuPhat]);
    //   }
      
    //   // 2. Thông tin gia hạn và trễ (nếu có)
    //   if (br.SoLanGiaHan && br.SoLanGiaHan > 0) {
    //     fineData.push(["Số lần gia hạn", `${br.SoLanGiaHan} lần`]);
    //   }
      
    //   // Hiển thị chi tiết số ngày trễ theo mức gia hạn
    //   if (daysLate > 0) {
    //     if (br.SoLanGiaHan === 0) {
    //       fineData.push(["Số ngày trễ (chưa gia hạn)", `${daysLate} ngày`]);
    //     } else if (br.SoLanGiaHan === 1) {
    //       fineData.push(["Số ngày trễ (sau gia hạn lần 1)", `${daysLate} ngày`]);
    //     } else if (br.SoLanGiaHan >= 2) {
    //       fineData.push(["Số ngày trễ (sau gia hạn lần 2)", `${daysLate} ngày`]);
    //     }
    //   }
      
    //   // 3. PHẠT TRỄ HẠN - Hiển thị chi tiết đầy đủ
    //   if (daysLate > 0 && lateFine > 0) {
    //     // Giải thích mức phạt dựa vào SỐ LẦN GIA HẠN
    //     let rateExplanation = "";
    //     if (br.SoLanGiaHan === 0) {
    //       rateExplanation = " (chưa gia hạn)";
    //     } else if (br.SoLanGiaHan === 1) {
    //       rateExplanation = " (sau gia hạn lần 1)";
    //     } else if (br.SoLanGiaHan === 2) {
    //       rateExplanation = " (sau gia hạn lần 2)";
    //     }
        
    //     fineData.push([
    //       "Phạt trễ hạn",
    //       `${daysLate} ngày × ${fineRate.toLocaleString("vi-VN")} đ${rateExplanation} = ${lateFine.toLocaleString("vi-VN")} đ`
    //     ]);
    //   } else {
    //     fineData.push(["Phạt trễ hạn", "0 đ (trả đúng hạn)"]);
    //   }
      
    //   // 4. PHẠT HƯ HỎNG/MẤT SÁCH - Chi tiết đầy đủ VỚI GIÁ SÁCH THẬT
    //   if (["Hư hỏng", "Mất sách"].includes(br.TrangThai)) {
    //     if (br.TrangThai === "Hư hỏng") {
    //       const damageLevel = br.MucDoHuHong || "Không rõ";
    //       const percentage = damageLevel === "Nhẹ" ? 30 : damageLevel === "Nặng" ? 70 : 0;
          
    //       if (bookPrice > 0 && percentage > 0) {
    //         const calculatedDamage = Math.round(bookPrice * percentage / 100);
    //         fineData.push([
    //           `Phạt hư hỏng (${damageLevel})`,
    //           `${percentage}% × ${bookPrice.toLocaleString("vi-VN")} đ = ${calculatedDamage.toLocaleString("vi-VN")} đ`
    //         ]);
    //       } else {
    //         fineData.push([
    //           `Phạt hư hỏng (${damageLevel})`,
    //           `${percentage}% giá sách`
    //         ]);
    //       }
    //     } else if (br.TrangThai === "Mất sách") {
    //       if (bookPrice > 0) {
    //         const lostFee = 50000;
    //         fineData.push([
    //           "Phạt mất sách",
    //           `100% × ${bookPrice.toLocaleString("vi-VN")} đ + ${lostFee.toLocaleString("vi-VN")} đ phí = ${(bookPrice + lostFee).toLocaleString("vi-VN")} đ`
    //         ]);
    //       } else {
    //         fineData.push([
    //           "Phạt mất sách",
    //           "100% giá sách + 50,000 đ phí xử lý"
    //         ]);
    //       }
    //     }
    //   }
      
    //   // 5. Hiển thị các dòng
    //   fineData.forEach((row, i) => {
    //     const bg = i % 2 === 0 ? "#fff3f3" : "#ffffff";
    //     doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
        
    //     doc.fillColor("#000000").font(fontBold).fontSize(11);
    //     doc.text(row[0], 50, tableTop + 7, { width: 180, align: "left" });
        
    //     doc.font(fontRegular);
    //     doc.text(row[1], 240, tableTop + 7, { width: 305, align: "left" });
        
    //     tableTop += 25;
    //   });
      
    //   // 6. TỔNG CỘNG
    //   doc.rect(40, tableTop, 515, 30).fillAndStroke("#d32f2f", "#d32f2f");
    //   doc.fillColor("#ffffff").font(fontBold).fontSize(13);
    //   doc.text("TỔNG TIỀN PHẠT", 50, tableTop + 9, { width: 180, align: "left" });
    //   doc.fontSize(15);
      
    //   // Hiển thị công thức tính tổng nếu có cả 2 loại phạt
    //   if (lateFine > 0 && damageFine > 0) {
    //     doc.fontSize(11);
    //     doc.text(
    //       `(${lateFine.toLocaleString("vi-VN")} + ${damageFine.toLocaleString("vi-VN")})`,
    //       240, tableTop + 5, { width: 305, align: "right" }
    //     );
    //     doc.fontSize(15);
    //     doc.text(
    //       `${br.TienPhat.toLocaleString("vi-VN")} đ`,
    //       240, tableTop + 16, { width: 305, align: "right" }
    //     );
    //   } else {
    //     doc.text(
    //       `${br.TienPhat.toLocaleString("vi-VN")} đ`,
    //       240, tableTop + 9, { width: 305, align: "right" }
    //     );
    //   }
      
    //   tableTop += 30;
    //   doc.moveDown(0.5);
    // }
    
    doc.fillColor("#000000");

    /* NHÂN VIÊN XỬ LÝ - TABLE */
    tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("NHÂN VIÊN XỬ LÝ", 40, tableTop + 7, { width: 515, align: "center" });
    
    tableTop += 25;
    
    // Rows
    const empData = [
      ["MSNV", emp.MSNV || br.MSNV || "—"],
      ["Họ tên", emp.HoTenNV || "—"],
      ["Ngày in", new Date().toLocaleDateString("vi-VN")]
    ];
    
    empData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(11);
      doc.text(row[0], 50, tableTop + 7, { width: 150, align: "left" });
      
      doc.font(fontRegular);
      doc.text(row[1], 210, tableTop + 7, { width: 335, align: "left" });
      
      tableTop += 25;
    });

    /* SIGNATURE SECTION */
    const signY = tableTop + 20;
    
    doc.fillColor("#000000").font(fontBold).fontSize(10);
    doc.text("Nhân viên xử lý", 80, signY, { width: 150, align: "center" });
    doc.text("Độc giả", 370, signY, { width: 150, align: "center" });
    
    doc.font(fontRegular).fontSize(8).fillColor("#666666");
    doc.text("(Ký và ghi rõ họ tên)", 80, signY + 40, { width: 150, align: "center" });
    doc.text("(Ký và ghi rõ họ tên)", 370, signY + 40, { width: 150, align: "center" });

    /* FOOTER */
    doc.y = signY + 60;
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font(fontRegular).fontSize(9).fillColor("#666666");
    const now = new Date();
    doc.text(
      `In lúc: ${now.toLocaleString("vi-VN", { 
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      })}`,
      40, doc.y, { align: "center" }
    );

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
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.y = 105; // Set Y position after logo
    }
    doc.font(fontBold).fontSize(16).fillColor("#d32f2f").text("PHIẾU PHẠT", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#666666").text(`Mã phiếu: ${br._id}`, { align: "center" });
    doc.fillColor("#000000");
    doc.moveDown(0.5);

    /* THÔNG TIN ĐỘC GIẢ - TABLE */
    let tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 20).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(11);
    doc.text("THÔNG TIN ĐỘC GIẢ", 40, tableTop + 5, { width: 515, align: "center" });
    
    tableTop += 20;
    
    // Rows
    const readerData = [
      ["Mã độc giả", reader.MaDocGia || "—"],
      ["Họ tên", `${reader.HoLot || ""} ${reader.Ten || ""}`],
      ["Điện thoại", reader.DienThoai || "—"]
    ];
    
    readerData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 20).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(10);
      doc.text(row[0], 50, tableTop + 5, { width: 150, align: "left" });
      
      doc.font(fontRegular).fontSize(10);
      doc.text(row[1], 210, tableTop + 5, { width: 335, align: "left" });
      
      tableTop += 20;
    });
    
    doc.moveDown(1);

    /* THÔNG TIN SÁCH - TABLE */
    tableTop = doc.y;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("THÔNG TIN SÁCH", 40, tableTop + 7, { width: 515, align: "center" });
    
    tableTop += 25;
    
    // Rows
    const bookData = [
      ["Mã sách", book.MaSach || "—"],
      ["Tên sách", book.TenSach || "—"],
      ["Đơn giá", book.DonGia ? `${book.DonGia.toLocaleString("vi-VN")} đ` : "—"]
    ];
    
    bookData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(11);
      doc.text(row[0], 50, tableTop + 7, { width: 150, align: "left" });
      
      doc.font(fontRegular);
      doc.text(row[1], 210, tableTop + 7, { width: 335, align: "left" });
      
      tableTop += 25;
    });
    
    /* THÔNG TIN MƯỢN - TABLE */
    tableTop += 8;
    
    // Header
    doc.rect(40, tableTop, 515, 20).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(11);
    doc.text("THÔNG TIN MƯỢN", 40, tableTop + 5, { width: 515, align: "center" });
    
    tableTop += 20;
    
    // Rows - BỎ "Số ngày trễ"
    const borrowData = [
      ["Ngày mượn", formatDate(br.NgayMuon)],
      ["Hạn trả", formatDate(br.HanTra)],
      ["Ngày trả", br.NgayTra ? formatDate(br.NgayTra) : "Chưa trả"],
      ["Trạng thái", br.TrangThai]
    ];
    
    borrowData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 20).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(10);
      doc.text(row[0], 50, tableTop + 5, { width: 150, align: "left" });
      
      doc.font(fontRegular).fontSize(10);
      doc.text(row[1], 210, tableTop + 5, { width: 335, align: "left" });
      
      tableTop += 20;
    });
    
    /* CHI TIẾT XỬ PHẠT - TABLE */
    tableTop += 8;
    
    // Header
    doc.rect(40, tableTop, 515, 20).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(11);
    doc.text("CHI TIẾT XỬ PHẠT", 40, tableTop + 5, { width: 515, align: "center" });
    
    tableTop += 20;
    
    // Lấy thông tin sách để tính chính xác giá phạt hư hỏng/mất
    const bookInfo = await Book.findOne({ MaSach: br.MaSach });
    const bookPrice = bookInfo ? bookInfo.DonGia : 0;
    
    // Calculate fine breakdown - mức phạt cố định 5k/ngày
    let daysLate = 0;
    let lateFine = 0;
    let damageFine = 0;
    const fineRate = 5000; // Mức phạt cố định
    
    // Tính số ngày trễ (giống service: so sánh ngày không tính giờ)
    if (br.NgayTra && br.HanTra) {
      const hanTraDate = new Date(br.HanTra);
      hanTraDate.setHours(0, 0, 0, 0);
      const ngayTraDate = new Date(br.NgayTra);
      ngayTraDate.setHours(0, 0, 0, 0);
      
      if (ngayTraDate > hanTraDate) {
        daysLate = Math.floor((ngayTraDate - hanTraDate) / 86400000);
        lateFine = daysLate * fineRate;
      }
    }
    
    // Tính phạt hư hỏng/mất (phần còn lại sau khi trừ phạt trễ)
    if (["Hư hỏng", "Mất sách"].includes(br.TrangThai)) {
      damageFine = br.TienPhat - lateFine;
    }
    
    // Rows - hiển thị đầy đủ chi tiết
    const fineData = [];
    
    // 1. Lý do xử phạt (nếu có)
    if (br.LyDoXuPhat) {
      fineData.push(["Lý do xử phạt", br.LyDoXuPhat]);
    }
    
    // 2. Mức độ hư hỏng (nếu có)
    if (br.MucDoHuHong && br.MucDoHuHong !== "—") {
      fineData.push(["Mức độ hư hỏng", br.MucDoHuHong]);
    }
    
    // 3. Thông tin gia hạn (nếu có)
    if (br.SoLanGiaHan && br.SoLanGiaHan > 0) {
      fineData.push(["Số lần gia hạn", `${br.SoLanGiaHan} lần`]);
    }
    
    // Hiển thị số ngày trễ (nếu có)
    if (daysLate > 0) {
      fineData.push(["Số ngày trễ hạn", `${daysLate} ngày`]);
    }
    
      // 4. PHẠT TRỄ HẠN - Hiển thị chi tiết
      if (daysLate > 0 && lateFine > 0) {
        fineData.push([
          "Phạt trễ hạn",
          `${daysLate} ngày × ${fineRate.toLocaleString("vi-VN")} đ = ${lateFine.toLocaleString("vi-VN")} đ`
        ]);
      } else {
        fineData.push(["Phạt trễ hạn", "0 đ (trả đúng hạn)"]);
      }    
    // 5. PHẠT HƯ HỎNG/MẤT SÁCH - Chi tiết đầy đủ VỚI GIÁ SÁCH THẬT
    damageFine = 0;
    if (["Hư hỏng", "Mất sách"].includes(br.TrangThai)) {
      if (br.TrangThai === "Hư hỏng") {
        const damageLevel = br.MucDoHuHong || "Không rõ";
        const percentage = damageLevel === "Nhẹ" ? 30 : damageLevel === "Nặng" ? 70 : 0;
        
        if (bookPrice > 0 && percentage > 0) {
          const calculatedDamage = Math.round(bookPrice * percentage / 100);
          fineData.push([
            `Phạt hư hỏng (${damageLevel})`,
            `${percentage}% × ${bookPrice.toLocaleString("vi-VN")} đ = ${calculatedDamage.toLocaleString("vi-VN")} đ`
          ]);
          damageFine += calculatedDamage;
        } else {
          fineData.push([
            `Phạt hư hỏng (${damageLevel})`,
            `${percentage}% giá sách`
          ]);
        }
      } else if (br.TrangThai === "Mất sách") {
        if (bookPrice > 0) {
          const lostFee = 50000;
          const calculatedLost = Math.round(bookPrice + 50000);
          fineData.push([
            "Phạt mất sách",
            `100% × ${bookPrice.toLocaleString("vi-VN")} đ + ${lostFee.toLocaleString("vi-VN")} đ phí = ${calculatedLost.toLocaleString("vi-VN")} đ`
          ]);
          damageFine += calculatedLost;
        } else {
          fineData.push([
            "Phạt mất sách",
            "100% giá sách + 50,000 đ phí xử lý"
          ]);
        }
      }
    }

    
    // 6. Ghi chú (nếu có)
    if (br.GhiChu) {
      fineData.push(["Ghi chú", br.GhiChu]);
    }
    
    // 7. Hiển thị các dòng
    fineData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 20).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(10);
      doc.text(row[0], 50, tableTop + 5, { width: 180, align: "left" });
      
      doc.font(fontRegular).fontSize(10);
      doc.text(row[1], 240, tableTop + 5, { width: 305, align: "left" });
      
      tableTop += 20;
    });
    
    // 8. TỔNG CỘNG - highlighted
    doc.rect(40, tableTop, 515, 26).fillAndStroke("#d32f2f", "#d32f2f");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("TỔNG TIỀN PHẠT", 50, tableTop + 7, { width: 180, align: "left" });
    doc.fontSize(13);
    
    // Hiển thị công thức tính tổng nếu có cả 2 loại phạt
    if (lateFine > 0 && damageFine > 0) {
      doc.fontSize(9);
      doc.text(
        `(${lateFine.toLocaleString("vi-VN")} + ${damageFine.toLocaleString("vi-VN")})`,
        240, tableTop + 4, { width: 305, align: "right" }
      );
      doc.fontSize(13);
      doc.text(
        `${br.TienPhat.toLocaleString("vi-VN")} đ`,
        240, tableTop + 13, { width: 305, align: "right" }
      );
    } else {
      doc.text(
        `${br.TienPhat.toLocaleString("vi-VN")} đ`,
        240, tableTop + 7, { width: 305, align: "right" }
      );
    }
    
    tableTop += 26;
    
    /* NHÂN VIÊN XỬ LÝ - TABLE */
    tableTop += 4; // Giảm khoảng cách từ 8 xuống 4
    
    // Header
    doc.rect(40, tableTop, 515, 20).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(11);
    doc.text("NHÂN VIÊN XỬ LÝ", 40, tableTop + 5, { width: 515, align: "center" });
    
    tableTop += 20;
    
    // Rows
    const empData = [
      ["MSNV", emp.MSNV || br.MSNV || "—"],
      ["Họ tên", emp.HoTenNV || "—"],
      ["Ngày in", new Date().toLocaleDateString("vi-VN")]
    ];
    
    empData.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 20).fillAndStroke(bg, "#e0e0e0");
      
      doc.fillColor("#000000").font(fontBold).fontSize(10);
      doc.text(row[0], 50, tableTop + 5, { width: 150, align: "left" });
      
      doc.font(fontRegular).fontSize(10);
      doc.text(row[1], 210, tableTop + 5, { width: 335, align: "left" });
      
      tableTop += 20;
    });

    /* SIGNATURE SECTION */
    const signY = tableTop + 15;
    
    doc.fillColor("#000000").font(fontBold).fontSize(9);
    doc.text("Nhân viên xử lý", 80, signY, { width: 150, align: "center" });
    doc.text("Độc giả", 370, signY, { width: 150, align: "center" });
    
    doc.font(fontRegular).fontSize(8).fillColor("#666666");
    doc.text("(Ký và ghi rõ họ tên)", 80, signY + 35, { width: 150, align: "center" });
    doc.text("(Ký và ghi rõ họ tên)", 370, signY + 35, { width: 150, align: "center" });

    /* FOOTER */
    doc.y = signY + 50;
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font(fontRegular).fontSize(9).fillColor("#666666");
    const now = new Date();
    doc.text(
      `In lúc: ${now.toLocaleString("vi-VN", { 
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      })}`,
      40, doc.y, { align: "center" }
    );

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

    /* HEADER */
    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).text("BÁO CÁO THỐNG KÊ TỔNG QUAN", { align: "center" });
    line(doc);

    /* NỘI DUNG */
    const startY = doc.y;
    const boxHeight = 80;
    const boxWidth = 240;
    const gap = 30;

    // Box 1: Tổng số sách
    doc.rect(40, startY, boxWidth, boxHeight).fillAndStroke("#e3f2fd", "#1976d2");
    doc.fillColor("#000000").font(fontBold).fontSize(14).text("Tổng số sách", 50, startY + 20, { width: boxWidth - 20 });
    doc.font(fontBold).fontSize(28).fillColor("#1976d2").text(data.totalBooks.toString(), 50, startY + 45, { width: boxWidth - 20 });

    // Box 2: Độc giả
    doc.fillColor("#000000");
    doc.rect(40 + boxWidth + gap, startY, boxWidth, boxHeight).fillAndStroke("#e8f5e9", "#4caf50");
    doc.font(fontBold).fontSize(14).text("Độc giả hoạt động", 40 + boxWidth + gap + 10, startY + 20, { width: boxWidth - 20 });
    doc.font(fontBold).fontSize(28).fillColor("#4caf50").text(data.totalReaders.toString(), 40 + boxWidth + gap + 10, startY + 45, { width: boxWidth - 20 });

    doc.fillColor("#000000");
    const startY2 = startY + boxHeight + 20;

    // Box 3: Sách đang mượn
    doc.rect(40, startY2, boxWidth, boxHeight).fillAndStroke("#fff3e0", "#ff9800");
    doc.font(fontBold).fontSize(14).text("Sách đang mượn", 50, startY2 + 20, { width: boxWidth - 20 });
    doc.font(fontBold).fontSize(28).fillColor("#ff9800").text(data.borrowing.toString(), 50, startY2 + 45, { width: boxWidth - 20 });

    // Box 4: Sách quá hạn
    doc.fillColor("#000000");
    doc.rect(40 + boxWidth + gap, startY2, boxWidth, boxHeight).fillAndStroke("#ffebee", "#f44336");
    doc.font(fontBold).fontSize(14).text("Sách quá hạn", 40 + boxWidth + gap + 10, startY2 + 20, { width: boxWidth - 20 });
    doc.font(fontBold).fontSize(28).fillColor("#f44336").text(data.overdue.toString(), 40 + boxWidth + gap + 10, startY2 + 45, { width: boxWidth - 20 });

    /* FOOTER */
    doc.fillColor("#000000");
    doc.y = startY2 + boxHeight + 40;
    line(doc);
    doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });

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
    const { type } = req.query; // 'books', 'readers', hoặc không có (cả 2)
    
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Nếu chỉ in top books
    if (type === 'books') {
      const books = await statisticsService.getTopBooks();
      
      /* HEADER */
      // Logo
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 250, 30, { width: 80 });
        doc.moveDown(4);
      }
      doc.font(fontBold).fontSize(18).text("TOP 5 SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT", { align: "center" });
      line(doc);
      
      /* TABLE */
      const tableTop = doc.y;
      const colX = [50, 100, 450];
      
      // Header
      doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
      doc.fillColor("#ffffff").font(fontBold).fontSize(12);
      doc.text("STT", colX[0], tableTop + 10, { width: 50, align: "center" });
      doc.text("Tên sách", colX[1], tableTop + 10, { width: 340 });
      doc.text("Lượt mượn", colX[2], tableTop + 10, { width: 105, align: "center" });
      
      // Rows
      doc.fillColor("#000000").font(fontRegular).fontSize(11);
      let rowY = tableTop + 30;
      
      books.forEach((b, i) => {
        const bgColor = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
        doc.rect(40, rowY, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
        doc.fillColor("#000000");
        doc.text((i + 1).toString(), colX[0], rowY + 7, { width: 50, align: "center" });
        doc.text(b.TenSach, colX[1], rowY + 7, { width: 340 });
        doc.font(fontBold).text(b.count.toString(), colX[2], rowY + 7, { width: 105, align: "center" });
        doc.font(fontRegular);
        rowY += 25;
      });
      
      /* FOOTER */
      doc.y = rowY + 20;
      line(doc);
      doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });
      
      doc.end();
      return;
    }

    // Nếu chỉ in top readers
    if (type === 'readers') {
      const readers = await statisticsService.getTopReaders();
      
      /* HEADER */
      // Logo
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 250, 30, { width: 80 });
        doc.moveDown(4);
      }
      doc.font(fontBold).fontSize(18).text("TOP 5 ĐỘC GIẢ MƯỢN NHIỀU NHẤT", { align: "center" });
      line(doc);
      
      /* TABLE */
      const tableTop = doc.y;
      const colX = [50, 100, 450];
      
      // Header
      doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
      doc.fillColor("#ffffff").font(fontBold).fontSize(12);
      doc.text("STT", colX[0], tableTop + 10, { width: 50, align: "center" });
      doc.text("Họ tên độc giả", colX[1], tableTop + 10, { width: 340 });
      doc.text("Lượt mượn", colX[2], tableTop + 10, { width: 105, align: "center" });
      
      // Rows
      doc.fillColor("#000000").font(fontRegular).fontSize(11);
      let rowY = tableTop + 30;
      
      readers.forEach((r, i) => {
        const bgColor = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
        doc.rect(40, rowY, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
        doc.fillColor("#000000");
        doc.text((i + 1).toString(), colX[0], rowY + 7, { width: 50, align: "center" });
        doc.text(r.HoTen, colX[1], rowY + 7, { width: 340 });
        doc.font(fontBold).text(r.count.toString(), colX[2], rowY + 7, { width: 105, align: "center" });
        doc.font(fontRegular);
        rowY += 25;
      });
      
      /* FOOTER */
      doc.y = rowY + 20;
      line(doc);
      doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });
      
      doc.end();
      return;
    }

    // Mặc định: in cả 2
    const books = await statisticsService.getTopBooks();
    const readers = await statisticsService.getTopReaders();

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

    /* HEADER */
    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).text(`THỐNG KÊ MƯỢN / TRẢ NĂM ${d.year}`, { align: "center" });
    line(doc);

    /* TABLE */
    const tableTop = doc.y;
    const colX = [50, 200, 350];
    
    // Header
    doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("Tháng", colX[0], tableTop + 10, { width: 140, align: "center" });
    doc.text("Lượt mượn", colX[1], tableTop + 10, { width: 140, align: "center" });
    doc.text("Lượt trả", colX[2], tableTop + 10, { width: 205, align: "center" });
    
    // Rows
    doc.fillColor("#000000").font(fontRegular).fontSize(11);
    let rowY = tableTop + 30;
    let totalBorrow = 0;
    let totalReturn = 0;
    
    d.months.forEach((m, i) => {
      const bgColor = i % 2 === 0 ? "#fff3e0" : "#ffffff";
      doc.rect(40, rowY, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
      doc.fillColor("#000000");
      doc.font(fontBold).text(`Tháng ${m}`, colX[0], rowY + 7, { width: 140, align: "center" });
      doc.font(fontRegular).text(d.borrow[i].toString(), colX[1], rowY + 7, { width: 140, align: "center" });
      doc.text(d.return[i].toString(), colX[2], rowY + 7, { width: 205, align: "center" });
      totalBorrow += d.borrow[i];
      totalReturn += d.return[i];
      rowY += 25;
    });
    
    // Tổng kết
    doc.rect(40, rowY, 515, 30).fillAndStroke("#e0e0e0", "#000000");
    doc.fillColor("#000000").font(fontBold).fontSize(13);
    doc.text("TỔNG", colX[0], rowY + 9, { width: 140, align: "center" });
    doc.text(totalBorrow.toString(), colX[1], rowY + 9, { width: 140, align: "center" });
    doc.text(totalReturn.toString(), colX[2], rowY + 9, { width: 205, align: "center" });

    /* FOOTER */
    doc.y = rowY + 50;
    line(doc);
    doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });

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

    /* HEADER */
    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).text("THỐNG KÊ TRẠNG THÁI PHIẾU MƯỢN", { align: "center" });
    doc.font(fontRegular).fontSize(13).text(`Tháng ${d.month}/${d.year}`, { align: "center" });
    line(doc);

    /* TABLE */
    const tableTop = doc.y;
    const colX = [50, 350];
    
    // Header
    doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("Trạng thái", colX[0], tableTop + 10, { width: 290 });
    doc.text("Số lượng", colX[1], tableTop + 10, { width: 205, align: "center" });
    
    // Rows
    doc.fillColor("#000000").font(fontRegular).fontSize(11);
    let rowY = tableTop + 30;
    let total = 0;
    
    d.labels.forEach((label, i) => {
      const bgColor = i % 2 === 0 ? "#f3e5f5" : "#ffffff";
      doc.rect(40, rowY, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
      doc.fillColor("#000000");
      doc.text(label, colX[0], rowY + 7, { width: 290 });
      doc.font(fontBold).text(d.values[i].toString(), colX[1], rowY + 7, { width: 205, align: "center" });
      doc.font(fontRegular);
      total += d.values[i];
      rowY += 25;
    });
    
    // Tổng
    doc.rect(40, rowY, 515, 30).fillAndStroke("#e0e0e0", "#000000");
    doc.fillColor("#000000").font(fontBold).fontSize(13);
    doc.text("TỔNG CỘNG", colX[0], rowY + 9, { width: 290 });
    doc.text(total.toString(), colX[1], rowY + 9, { width: 205, align: "center" });

    /* FOOTER */
    doc.y = rowY + 50;
    line(doc);
    doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });

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

    /* HEADER */
    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).text("THỐNG KÊ TIỀN PHẠT", { align: "center" });
    doc.font(fontRegular).fontSize(13).text(`Tháng ${d.month}/${d.year}`, { align: "center" });
    line(doc);
    
    /* Tổng tiền phạt */
    doc.font(fontBold).fontSize(16).fillColor("#f44336");
    doc.text(`Tổng tiền phạt: ${d.totalFine.toLocaleString("vi-VN")} VNĐ`, { align: "center" });
    doc.fillColor("#000000");
    doc.moveDown();

    /* TABLE */
    const tableTop = doc.y;
    const colX = [50, 90, 290, 420];
    
    // Header
    doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(12);
    doc.text("STT", colX[0], tableTop + 10, { width: 40, align: "center" });
    doc.text("Họ tên", colX[1], tableTop + 10, { width: 190 });
    doc.text("Loại", colX[2], tableTop + 10, { width: 120 });
    doc.text("Tiền phạt", colX[3], tableTop + 10, { width: 135, align: "center" });
    
    // Rows
    doc.fillColor("#000000").font(fontRegular).fontSize(10);
    let rowY = tableTop + 30;
    
    d.records.forEach((r, i) => {
      const bgColor = i % 2 === 0 ? "#ffebee" : "#ffffff";
      doc.rect(40, rowY, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
      doc.fillColor("#000000");
      doc.text((i + 1).toString(), colX[0], rowY + 7, { width: 40, align: "center" });
      doc.text(r.HoTen, colX[1], rowY + 7, { width: 190 });
      doc.text(r.Loai, colX[2], rowY + 7, { width: 120 });
      doc.font(fontBold).text(`${r.TienPhat.toLocaleString("vi-VN")} đ`, colX[3], rowY + 7, { width: 135, align: "center" });
      doc.font(fontRegular);
      rowY += 25;
    });

    /* FOOTER */
    doc.y = rowY + 20;
    line(doc);
    doc.font(fontRegular).fontSize(11).text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });

    doc.end();
  } catch (err) {
    res.status(500).send("Lỗi xuất PDF tiền phạt");
  }
};

/* ==========================================================
   THỐNG KÊ SÁCH HƯ HỎNG VÀ MẤT
========================================================== */
exports.printDamagedAndLostBooks = async (req, res) => {
  try {
    const data = await statisticsService.getDamagedAndLostBooks();

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    /* HEADER */
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 250, 30, { width: 80 });
      doc.moveDown(4);
    }
    doc.font(fontBold).fontSize(18).text("THỐNG KÊ SÁCH HƯ HỎNG VÀ MẤT", { align: "center" });
    doc.font(fontRegular).fontSize(13).text(`Tổng số sách: ${data.books.length}`, { align: "center" });
    line(doc);

    /* TABLE */
    let tableTop = doc.y;
    const colX = [50, 110, 360, 420, 480];
    
    // Header
    doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
    doc.fillColor("#ffffff").font(fontBold).fontSize(11);
    doc.text("STT", colX[0], tableTop + 10, { width: 50, align: "center" });
    doc.text("Tên sách", colX[1], tableTop + 10, { width: 240, align: "left" });
    doc.text("HH Nhẹ", colX[2], tableTop + 10, { width: 50, align: "center" });
    doc.text("HH Nặng", colX[3], tableTop + 10, { width: 50, align: "center" });
    doc.text("Mất", colX[4], tableTop + 10, { width: 50, align: "center" });
    
    tableTop += 30;

    // Rows
    doc.fillColor("#000000").font(fontRegular).fontSize(10);
    data.books.forEach((book, i) => {
      const bgColor = i % 2 === 0 ? "#f5f5f5" : "#ffffff";
      doc.rect(40, tableTop, 515, 25).fillAndStroke(bgColor, "#e0e0e0");
      
      // STT
      doc.fillColor("#000000").font(fontRegular);
      doc.text((i + 1).toString(), colX[0], tableTop + 7, { width: 50, align: "center" });
      
      // Tên sách
      doc.fillColor("#000000").font(fontRegular);
      doc.text(book.TenSach || "—", colX[1], tableTop + 7, { width: 240, align: "left" });
      
      // HH Nhẹ
      const lightCount = book.lightCount || 0;
      if (lightCount > 0) {
        doc.fillColor("#ff9800").font(fontBold);
      } else {
        doc.fillColor("#000000").font(fontRegular);
      }
      doc.text(lightCount.toString(), colX[2], tableTop + 7, { width: 50, align: "center" });
      
      // HH Nặng
      const heavyCount = book.heavyCount || 0;
      if (heavyCount > 0) {
        doc.fillColor("#f44336").font(fontBold);
      } else {
        doc.fillColor("#000000").font(fontRegular);
      }
      doc.text(heavyCount.toString(), colX[3], tableTop + 7, { width: 50, align: "center" });
      
      // Mất sách
      const lostCount = book.lostCount || 0;
      if (lostCount > 0) {
        doc.fillColor("#000000").font(fontBold);
      } else {
        doc.fillColor("#000000").font(fontRegular);
      }
      doc.text(lostCount.toString(), colX[4], tableTop + 7, { width: 50, align: "center" });
      
      tableTop += 25;

      // Add new page if needed
      if (tableTop > 720) {
        doc.addPage();
        tableTop = 50;
        
        // Redraw header on new page
        doc.rect(40, tableTop, 515, 30).fillAndStroke("#333333", "#333333");
        doc.fillColor("#ffffff").font(fontBold).fontSize(11);
        doc.text("STT", colX[0], tableTop + 10, { width: 50, align: "center" });
        doc.text("Tên sách", colX[1], tableTop + 10, { width: 240, align: "left" });
        doc.text("HH Nhẹ", colX[2], tableTop + 10, { width: 50, align: "center" });
        doc.text("HH Nặng", colX[3], tableTop + 10, { width: 50, align: "center" });
        doc.text("Mất", colX[4], tableTop + 10, { width: 50, align: "center" });
        tableTop += 30;
        doc.fillColor("#000000").font(fontRegular).fontSize(10);
      }
    });

    /* FOOTER */
    doc.y = tableTop + 20;
    line(doc);
    doc.font(fontRegular).fontSize(11).fillColor("#000000");
    doc.text(`Ngày in: ${new Date().toLocaleDateString("vi-VN")}, ${new Date().toLocaleTimeString("vi-VN")}`, { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi xuất PDF sách hư hỏng/mất");
  }
};
