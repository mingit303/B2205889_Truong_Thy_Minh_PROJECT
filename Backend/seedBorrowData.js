// seedBorrowData.js - Script để seed dữ liệu mượn sách và yêu cầu mượn sách
require("dotenv").config();
const mongoose = require("mongoose");
const BorrowRecord = require("./src/models/BorrowRecord");
const BorrowRequest = require("./src/models/BorrowRequest");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LibraryDB";

// Dữ liệu phiếu mượn sách
const borrowRecords = [
  // === CASE 1: Trả đúng hạn - Không phạt ===
  {
    MaDocGia: "DG001",
    MaSach: "S001",
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-01"),
    HanTra: new Date("2025-11-08T23:59:59"),
    NgayTra: new Date("2025-11-07"),
    TrangThai: "Đã trả",
    SoLanGiaHan: 0,
    SoLanTreHan: 0,
    TienPhat: 0,
  },

  // === CASE 2: Trễ 3 ngày (chưa gia hạn) - Phạt 15,000đ ===
  {
    MaDocGia: "DG002",
    MaSach: "S002",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-15"),
    HanTra: new Date("2025-10-22T23:59:59"),
    NgayTra: new Date("2025-10-25"), // Trả trễ 3 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 15000, // 3 × 5,000đ
    LyDoXuPhat: "Trễ hạn",
    DaThanhToanPhat: false,
  },

  // === CASE 3: Gia hạn 1 lần, trễ 4 ngày - Phạt 60,000đ ===
  {
    MaDocGia: "DG003",
    MaSach: "S003",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-01"),
    HanTra: new Date("2025-10-15T23:59:59"), // Đã gia hạn 7 ngày
    NgayTra: new Date("2025-10-19"), // Trễ 4 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 1,
    SoLanTreHan: 1, // Lần trễ đầu tiên sau gia hạn
    TienPhat: 60000, // 4 × 15,000đ
    LyDoXuPhat: "Trễ hạn sau khi gia hạn",
    DaThanhToanPhat: false,
  },

  // === CASE 4: Gia hạn 2 lần, trễ lần 2 (3 ngày) - Phạt 90,000đ ===
  {
    MaDocGia: "DG001",
    MaSach: "S004",
    MSNV: "NV001",
    NgayMuon: new Date("2025-09-15"),
    HanTra: new Date("2025-10-13T23:59:59"), // Đã gia hạn 2 lần
    NgayTra: new Date("2025-10-16"), // Trễ 3 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 2,
    SoLanTreHan: 2, // Lần trễ thứ 2
    TienPhat: 90000, // 3 × 30,000đ
    LyDoXuPhat: "Trễ hạn lần 2 sau gia hạn",
    DaThanhToanPhat: false,
  },

  // === CASE 5: Trễ 2 ngày + Hư hỏng nhẹ (30%) - Phạt 10,000đ + 30,000đ = 40,000đ ===
  {
    MaDocGia: "DG002",
    MaSach: "S005", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-01"),
    HanTra: new Date("2025-11-08T23:59:59"),
    NgayTra: new Date("2025-11-10"), // Trễ 2 ngày
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nhẹ",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 40000, // 2×5k (trễ) + 30k (30% giá 100k)
    LyDoXuPhat: "Trễ hạn; Hư hỏng nhẹ",
    DaThanhToanPhat: false,
  },

  // === CASE 6: Trễ 1 ngày + Hư hỏng nặng (70%) - Phạt 5,000đ + 70,000đ = 75,000đ ===
  {
    MaDocGia: "DG003",
    MaSach: "S006", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-10"),
    HanTra: new Date("2025-11-17T23:59:59"),
    NgayTra: new Date("2025-11-18"), // Trễ 1 ngày
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nặng",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 75000, // 1×5k (trễ) + 70k (70% giá 100k)
    LyDoXuPhat: "Trễ hạn; Hư hỏng nặng",
    DaThanhToanPhat: false,
  },

  // === CASE 7: Trễ 2 ngày + Mất sách (100% + 50k phí) - Phạt 10,000đ + 150,000đ = 160,000đ ===
  {
    MaDocGia: "DG001",
    MaSach: "S007", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-05"),
    HanTra: new Date("2025-11-12T23:59:59"),
    NgayTra: new Date("2025-11-14"), // Trễ 2 ngày
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 160000, // 2×5k (trễ) + 100k (giá sách) + 50k (phí xử lý)
    LyDoXuPhat: "Trễ hạn; Mất sách",
    DaThanhToanPhat: false,
  },

  // === CASE 8: Gia hạn 1 lần, trễ 3 ngày + Hư hỏng nhẹ - Phạt 45,000đ + 30,000đ = 75,000đ ===
  {
    MaDocGia: "DG002",
    MaSach: "S008", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-20"),
    HanTra: new Date("2025-11-10T23:59:59"), // Đã gia hạn
    NgayTra: new Date("2025-11-13"), // Trễ 3 ngày
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nhẹ",
    SoLanGiaHan: 1,
    SoLanTreHan: 1,
    TienPhat: 75000, // 3×15k (trễ sau gia hạn) + 30k (hư hỏng)
    LyDoXuPhat: "Trễ hạn sau khi gia hạn; Hư hỏng nhẹ",
    DaThanhToanPhat: true,
  },

  // === CASE 9: Gia hạn 2 lần, trễ lần 2 (2 ngày) + Mất sách - Phạt 60,000đ + 150,000đ = 210,000đ ===
  {
    MaDocGia: "DG003",
    MaSach: "S009", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-09-20"),
    HanTra: new Date("2025-10-18T23:59:59"), // Đã gia hạn 2 lần
    NgayTra: new Date("2025-10-20"), // Trễ 2 ngày
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    SoLanGiaHan: 2,
    SoLanTreHan: 2,
    TienPhat: 210000, // 2×30k (trễ lần 2) + 100k + 50k (mất)
    LyDoXuPhat: "Trễ hạn lần 2 sau gia hạn; Mất sách",
    DaThanhToanPhat: false,
  },

  // === CASE 10: Chỉ hư hỏng nhẹ, không trễ - Phạt 30,000đ ===
  {
    MaDocGia: "DG001",
    MaSach: "S001", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-20"),
    HanTra: new Date("2025-11-27T23:59:59"),
    NgayTra: new Date("2025-11-26"), // Không trễ
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nhẹ",
    SoLanGiaHan: 0,
    SoLanTreHan: 0,
    TienPhat: 30000, // Chỉ phạt hư hỏng
    LyDoXuPhat: "Hư hỏng nhẹ",
    DaThanhToanPhat: false,
  },

  // === CASE 11: Chỉ mất sách, không trễ - Phạt 150,000đ ===
  {
    MaDocGia: "DG002",
    MaSach: "S002", // Giá 100,000đ
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-22"),
    HanTra: new Date("2025-11-29T23:59:59"),
    NgayTra: new Date("2025-11-28"), // Không trễ
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    SoLanGiaHan: 0,
    SoLanTreHan: 0,
    TienPhat: 150000, // Chỉ phạt mất sách
    LyDoXuPhat: "Mất sách",
    DaThanhToanPhat: false,
  },

  // === CASE 12: Đang mượn (chưa hết hạn) ===
  {
    MaDocGia: "DG003",
    MaSach: "S003",
    MSNV: "NV001",
    NgayMuon: new Date("2025-12-01"),
    HanTra: new Date("2025-12-15T23:59:59"),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 0,
    SoLanTreHan: 0,
    TienPhat: 0,
  },

  // === CASE 13: Đã gia hạn 1 lần, đang mượn ===
  {
    MaDocGia: "DG001",
    MaSach: "S004",
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-20"),
    HanTra: new Date("2025-12-11T23:59:59"), // Đã gia hạn
    TrangThai: "Đã mượn",
    SoLanGiaHan: 1,
    SoLanTreHan: 0,
    TienPhat: 0,
  },

  // === CASE 14: Đang trễ hạn 2 ngày (chưa trả) ===
  {
    MaDocGia: "DG002",
    MaSach: "S005",
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-20"),
    HanTra: new Date("2025-12-03T23:59:59"),
    TrangThai: "Trễ hạn",
    SoLanGiaHan: 0,
    SoLanTreHan: 0,
    TienPhat: 0, // Sẽ tính khi trả
  },

  // === CASE 15: Gia hạn, đang trễ 3 ngày (chưa trả) ===
  {
    MaDocGia: "DG003",
    MaSach: "S006",
    MSNV: "NV001",
    NgayMuon: new Date("2025-11-08"),
    HanTra: new Date("2025-12-02T23:59:59"), // Đã gia hạn
    TrangThai: "Trễ hạn",
    SoLanGiaHan: 1,
    SoLanTreHan: 0,
    TienPhat: 0, // Sẽ tính khi trả
  },

  // === CASE 16-20: Các trường hợp đã thanh toán phạt ===
  {
    MaDocGia: "DG001",
    MaSach: "S007",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-10"),
    HanTra: new Date("2025-10-17T23:59:59"),
    NgayTra: new Date("2025-10-20"), // Trễ 3 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 15000,
    LyDoXuPhat: "Trễ hạn",
    DaThanhToanPhat: true, // Đã thanh toán
  },
  {
    MaDocGia: "DG002",
    MaSach: "S008",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-05"),
    HanTra: new Date("2025-10-26T23:59:59"),
    NgayTra: new Date("2025-10-30"), // Trễ 4 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 1,
    SoLanTreHan: 1,
    TienPhat: 60000,
    LyDoXuPhat: "Trễ hạn sau khi gia hạn",
    DaThanhToanPhat: true,
  },
  {
    MaDocGia: "DG003",
    MaSach: "S009",
    MSNV: "NV001",
    NgayMuon: new Date("2025-09-25"),
    HanTra: new Date("2025-10-23T23:59:59"),
    NgayTra: new Date("2025-10-25"), // Trễ 2 ngày
    TrangThai: "Đã trả",
    SoLanGiaHan: 2,
    SoLanTreHan: 2,
    TienPhat: 60000,
    LyDoXuPhat: "Trễ hạn lần 2 sau gia hạn",
    DaThanhToanPhat: true,
  },
  {
    MaDocGia: "DG001",
    MaSach: "S001",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-28"),
    HanTra: new Date("2025-11-04T23:59:59"),
    NgayTra: new Date("2025-11-05"),
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nặng",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 75000,
    LyDoXuPhat: "Trễ hạn; Hư hỏng nặng",
    DaThanhToanPhat: true,
  },
  {
    MaDocGia: "DG002",
    MaSach: "S002",
    MSNV: "NV001",
    NgayMuon: new Date("2025-10-15"),
    HanTra: new Date("2025-10-22T23:59:59"),
    NgayTra: new Date("2025-10-23"),
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    SoLanGiaHan: 0,
    SoLanTreHan: 1,
    TienPhat: 155000,
    LyDoXuPhat: "Trễ hạn; Mất sách",
    DaThanhToanPhat: true,
  },
];

// Dữ liệu yêu cầu mượn sách
const borrowRequests = [
  // Yêu cầu chờ duyệt
  {
    MaDocGia: "DG001",
    Sach: ["S001", "S002", "S003"],
    TrangThai: "CHO_DUYET",
  },
  {
    MaDocGia: "DG002",
    Sach: ["S004"],
    TrangThai: "CHO_DUYET",
  },
  {
    MaDocGia: "DG003",
    Sach: ["S005", "S006"],
    TrangThai: "CHO_DUYET",
  },

  // Yêu cầu đã duyệt
  {
    MaDocGia: "DG001",
    Sach: ["S007", "S008"],
    TrangThai: "DA_DUYET",
  },
  {
    MaDocGia: "DG002",
    Sach: ["S009"],
    TrangThai: "DA_DUYET",
  },

  // Yêu cầu bị từ chối
  {
    MaDocGia: "DG003",
    Sach: ["S010", "S011", "S012", "S013", "S014"],
    TrangThai: "TU_CHOI",
    LyDoTuChoi: "Vượt quá số lượng sách được mượn cùng lúc (tối đa 5 cuốn)",
  },
  {
    MaDocGia: "DG001",
    Sach: ["S020"],
    TrangThai: "TU_CHOI",
    LyDoTuChoi: "Sách hiện không còn trong kho",
  },
  {
    MaDocGia: "DG002",
    Sach: ["S015"],
    TrangThai: "TU_CHOI",
    LyDoTuChoi: "Độc giả đang có phiếu mượn quá hạn chưa trả",
  },
];

// Hàm seed dữ liệu
async function seedData() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ (nếu muốn reset hoàn toàn)
    console.log("\n🗑️  Clearing old data...");
    await BorrowRecord.deleteMany({});
    await BorrowRequest.deleteMany({});
    console.log("✅ Old data cleared");

    // Seed BorrowRecords
    console.log("\n📚 Seeding Borrow Records...");
    const createdRecords = await BorrowRecord.insertMany(borrowRecords);
    console.log(`✅ Created ${createdRecords.length} borrow records`);

    // Seed BorrowRequests
    console.log("\n📝 Seeding Borrow Requests...");
    const createdRequests = await BorrowRequest.insertMany(borrowRequests);
    console.log(`✅ Created ${createdRequests.length} borrow requests`);

    // Thống kê
    console.log("\n📊 Summary:");
    console.log(`   - Tổng phiếu mượn: ${createdRecords.length}`);
    console.log(`     • Đã mượn: ${createdRecords.filter(r => r.TrangThai === "Đã mượn").length}`);
    console.log(`     • Đã trả: ${createdRecords.filter(r => r.TrangThai === "Đã trả").length}`);
    console.log(`     • Trễ hạn: ${createdRecords.filter(r => r.TrangThai === "Trễ hạn").length}`);
    console.log(`     • Hư hỏng: ${createdRecords.filter(r => r.TrangThai === "Hư hỏng").length}`);
    console.log(`     • Mất sách: ${createdRecords.filter(r => r.TrangThai === "Mất sách").length}`);
    console.log(`   - Tổng yêu cầu mượn: ${createdRequests.length}`);
    console.log(`     • Chờ duyệt: ${createdRequests.filter(r => r.TrangThai === "CHO_DUYET").length}`);
    console.log(`     • Đã duyệt: ${createdRequests.filter(r => r.TrangThai === "DA_DUYET").length}`);
    console.log(`     • Từ chối: ${createdRequests.filter(r => r.TrangThai === "TU_CHOI").length}`);

    console.log("\n✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Chạy seed
seedData();
