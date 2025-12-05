// testFineSeed.js - Tạo dữ liệu test cho phạt trễ hạn
const mongoose = require("mongoose");
const BorrowRecord = require("./src/models/BorrowRecord");

mongoose.connect("mongodb://localhost:27017/library_management");

async function seed() {
  try {
    // Xóa dữ liệu cũ
    await BorrowRecord.deleteMany({});
    console.log("Đã xóa dữ liệu cũ");

    const now = new Date();

    // ========== TRƯỜNG HỢP 1: Trễ hạn bình thường (chưa gia hạn) ==========
    // Mượn 30 ngày trước, hạn trả 20 ngày trước, trả trễ 3 ngày
    // => Phạt: 3 ngày × 5,000đ = 15,000đ
    const case1 = await BorrowRecord.create({
      MaDocGia: "DG001",
      MaSach: "S001",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 30 * 86400000),
      HanTra: new Date(now.getTime() - 20 * 86400000),
      NgayTra: new Date(now.getTime() - 17 * 86400000), // Trễ 3 ngày
      TrangThai: "Đã trả",
      SoLanGiaHan: 0,
      SoLanTreHan: 1,
      TienPhat: 15000, // 3 × 5000
      LyDoXuPhat: "Trễ hạn",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 1: Trễ 3 ngày, chưa gia hạn => 15,000đ");

    // ========== TRƯỜNG HỢP 2: Gia hạn 1 lần, trễ lần đầu ==========
    // Mượn 40 ngày trước, gia hạn 1 lần, trả trễ 4 ngày
    // => Phạt: 4 ngày × 15,000đ = 60,000đ
    const case2 = await BorrowRecord.create({
      MaDocGia: "DG002",
      MaSach: "S002",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 40 * 86400000),
      HanTra: new Date(now.getTime() - 23 * 86400000), // Đã gia hạn 7 ngày
      NgayTra: new Date(now.getTime() - 19 * 86400000), // Trễ 4 ngày
      TrangThai: "Đã trả",
      SoLanGiaHan: 1,
      SoLanTreHan: 1, // Trễ lần đầu sau khi gia hạn
      TienPhat: 60000, // 4 × 15000
      LyDoXuPhat: "Trễ hạn sau khi gia hạn",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 2: Gia hạn 1 lần, trễ 4 ngày => 60,000đ");

    // ========== TRƯỜNG HỢP 3: Gia hạn 2 lần, trễ lần 2 ==========
    // Mượn 50 ngày trước, gia hạn 2 lần, trễ lần thứ 2
    // => Phạt: 3 ngày × 30,000đ = 90,000đ
    const case3 = await BorrowRecord.create({
      MaDocGia: "DG003",
      MaSach: "S003",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 50 * 86400000),
      HanTra: new Date(now.getTime() - 19 * 86400000), // Đã gia hạn 2 lần (14 ngày)
      NgayTra: new Date(now.getTime() - 16 * 86400000), // Trễ 3 ngày
      TrangThai: "Đã trả",
      SoLanGiaHan: 2,
      SoLanTreHan: 2, // Đã trễ 2 lần rồi
      TienPhat: 90000, // 3 × 30000
      LyDoXuPhat: "Trễ hạn 3 ngày khi gia hạn lần 2",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 3: Gia hạn 2 lần, trễ lần 2 (3 ngày) => 90,000đ");

    // ========== TRƯỜNG HỢP 4: Gia hạn 2 lần, đang trễ (chưa trả) ==========
    // Mượn 45 ngày trước, gia hạn 2 lần, hiện đang trễ 5 ngày
    // => Dự kiến phạt khi trả: 5 ngày × 30,000đ = 150,000đ
    const case4 = await BorrowRecord.create({
      MaDocGia: "DG004",
      MaSach: "S004",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 45 * 86400000),
      HanTra: new Date(now.getTime() - 5 * 86400000), // Trễ 5 ngày
      TrangThai: "Trễ hạn", // Chưa trả
      SoLanGiaHan: 2,
      SoLanTreHan: 1, // Đã trễ 1 lần rồi
      TienPhat: 45000, // Phạt lần trễ trước (đã cộng khi gia hạn)
      LyDoXuPhat: "Trễ hạn 3 ngày khi gia hạn lần 2",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 4: Gia hạn 2 lần, đang trễ 5 ngày (chưa trả)");

    // ========== TRƯỜNG HỢP 5: Hư hỏng nhẹ + Trễ hạn ==========
    // Trễ 2 ngày, gia hạn 1 lần => phạt trễ: 2 × 15,000 = 30,000đ
    // Hư hỏng nhẹ (30% giá sách 75,000đ) => 22,500đ
    // Tổng: 52,500đ
    const case5 = await BorrowRecord.create({
      MaDocGia: "DG005",
      MaSach: "S005",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 35 * 86400000),
      HanTra: new Date(now.getTime() - 12 * 86400000),
      NgayTra: new Date(now.getTime() - 10 * 86400000), // Trễ 2 ngày
      TrangThai: "Hư hỏng",
      MucDoHuHong: "Nhẹ",
      SoLanGiaHan: 1,
      SoLanTreHan: 1,
      TienPhat: 52500, // 30,000 (trễ) + 22,500 (hư hỏng)
      LyDoXuPhat: "Trễ hạn + Sách hư hỏng (Nhẹ)",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 5: Trễ 2 ngày + Hư hỏng nhẹ => 52,500đ");

    // ========== TRƯỜNG HỢP 6: Không trễ, trả đúng hạn ==========
    const case6 = await BorrowRecord.create({
      MaDocGia: "DG006",
      MaSach: "S006",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 25 * 86400000),
      HanTra: new Date(now.getTime() - 5 * 86400000),
      NgayTra: new Date(now.getTime() - 7 * 86400000), // Trả sớm 2 ngày
      TrangThai: "Đã trả",
      SoLanGiaHan: 0,
      SoLanTreHan: 0,
      TienPhat: 0,
      DaThanhToanPhat: true,
    });
    console.log("✓ Case 6: Trả đúng hạn => 0đ");

    // ========== TRƯỜNG HỢP 7: Mất sách + Trễ hạn ==========
    // Trễ 1 ngày, chưa gia hạn => phạt trễ: 1 × 5,000 = 5,000đ
    // Mất sách (100% giá 75,000đ + phí 50,000đ) => 125,000đ
    // Tổng: 130,000đ
    const case7 = await BorrowRecord.create({
      MaDocGia: "DG007",
      MaSach: "S007",
      MSNV: "NV001",
      NgayMuon: new Date(now.getTime() - 32 * 86400000),
      HanTra: new Date(now.getTime() - 8 * 86400000),
      NgayTra: new Date(now.getTime() - 7 * 86400000), // Trễ 1 ngày
      TrangThai: "Mất sách",
      MucDoHuHong: "Mất",
      SoLanGiaHan: 0,
      SoLanTreHan: 1,
      TienPhat: 130000, // 5,000 (trễ) + 125,000 (mất)
      LyDoXuPhat: "Trễ hạn + Mất sách",
      DaThanhToanPhat: false,
    });
    console.log("✓ Case 7: Trễ 1 ngày + Mất sách => 130,000đ");

    console.log("\n=== TỔNG KẾT ===");
    console.log("Đã tạo 7 trường hợp test:");
    console.log("1. Trễ 3 ngày (chưa gia hạn): 15,000đ");
    console.log("2. Gia hạn 1 lần, trễ 4 ngày: 60,000đ");
    console.log("3. Gia hạn 2 lần, trễ lần 2 (3 ngày): 90,000đ");
    console.log("4. Đang trễ 5 ngày (chưa trả)");
    console.log("5. Trễ 2 ngày + Hư hỏng nhẹ: 52,500đ");
    console.log("6. Trả đúng hạn: 0đ");
    console.log("7. Trễ 1 ngày + Mất sách: 130,000đ");

    process.exit(0);
  } catch (err) {
    console.error("Lỗi:", err);
    process.exit(1);
  }
}

seed();
