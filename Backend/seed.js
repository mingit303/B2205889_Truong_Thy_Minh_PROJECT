/**
 * SEED TOÀN BỘ DỮ LIỆU — VERSION CHUẨN HOÀN CHỈNH
 * -----------------------------------------------
 * Tạo đầy đủ:
 * - Config
 * - Employee
 * - Reader
 * - Publisher
 * - Author
 * - Category
 * - Book (ObjectId cho MaTheLoai, MaTacGia, MaNXB)
 * - BorrowRecord
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MODELS
const Employee = require("./src/models/Employee");
const Reader = require("./src/models/Reader");
const Publisher = require("./src/models/Publisher");
const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Category = require("./src/models/Category");
const Config = require("./src/models/Config");
const BorrowRecord = require("./src/models/BorrowRecord");

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected:", process.env.MONGO_URI);

    // CLEAR ALL
    console.log("\n🧹 Clearing old data...");
    await Promise.all([
      Employee.deleteMany({}),
      Reader.deleteMany({}),
      Publisher.deleteMany({}),
      Author.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      Config.deleteMany({}),
      BorrowRecord.deleteMany({}),
    ]);
    console.log("✔ All old data cleared.");

    // // ====================== CONFIG ======================
    console.log("\n⚙️ Creating system configs...");
    await Config.insertMany([
      { Ten: "SO_SACH_MUON_TOI_DA", GiaTri: "5" },
      { Ten: "SO_NGAY_MUON", GiaTri: "30" },
      { Ten: "SO_NGAY_GIA_HAN", GiaTri: "15" },
      { Ten: "SO_LAN_GIA_HAN_TOI_DA", GiaTri: "2" },
      { Ten: "TIEN_PHAT_MOI_NGAY", GiaTri: "5000" },
      { Ten: "TY_LE_PHAT_HU_HONG_NHE", GiaTri: "30" },
      { Ten: "TY_LE_PHAT_HU_HONG_NANG", GiaTri: "70" },
      { Ten: "TY_LE_PHAT_MAT_SACH", GiaTri: "100" },
      { Ten: "PHI_XU_LY_MAT_SACH", GiaTri: "50000" },
    ]);
    console.log("✔ Configs created.");

    // ====================== EMPLOYEE ======================
    console.log("\n👨‍💼 Creating employees...");
    const hashed = await bcrypt.hash("123456", 10);

    await Employee.insertMany([
      {
        MSNV: "NV001",
        HoTenNV: "Quản trị viên",
        Password: hashed,
        ChucVu: "SUPERADMIN",
        DiaChi: "System",
        SoDienThoai: "0900000000",
        VaiTro: "SUPERADMIN",
        TrangThai: 1,
      },
      {
        MSNV: "NV002",
        HoTenNV: "Nhân viên A",
        Password: hashed,
        ChucVu: "Admin",
        DiaChi: "HCM",
        SoDienThoai: "0901111111",
        VaiTro: "ADMIN",
        TrangThai: 1,
      },
    ]);
    console.log("✔ Employees created.");

    // ====================== READERS ======================
    console.log("\n📚 Creating readers...");
    await Reader.insertMany([
      {
        MaDocGia: "DG001",
        HoLot: "Lê Văn",
        Ten: "An",
        NgaySinh: new Date("2000-05-15"),
        Phai: "Nam",
        DiaChi: "TP.HCM",
        DienThoai: "0912345678",
        Email: "an@example.com",
        MatKhau: hashed,
        TrangThai: 1,
      },
      {
        MaDocGia: "DG002",
        HoLot: "Phạm Thị",
        Ten: "Bích",
        NgaySinh: new Date("1998-08-20"),
        Phai: "Nữ",
        DiaChi: "Hà Nội",
        DienThoai: "0923456789",
        Email: "bich@example.com",
        MatKhau: hashed,
        TrangThai: 1,
      },
    ]);
    console.log("✔ Readers created.");

    // ====================== PUBLISHERS ======================
    console.log("\n🏢 Creating publishers...");
    const publishers = await Publisher.insertMany([
      { MaNXB: "NXB001", TenNXB: "NXB Trẻ", DiaChi: "TP.HCM" },
      { MaNXB: "NXB002", TenNXB: "NXB Kim Đồng", DiaChi: "Hà Nội" },
      { MaNXB: "NXB003", TenNXB: "NXB Văn Học", DiaChi: "Hà Nội" },
    ]);
    console.log("✔ Publishers created.");

    const publisherMap = {};
    publishers.forEach((p) => {
      publisherMap[p.MaNXB] = p._id;
    });

    // ====================== AUTHORS ======================
    console.log("\n✍️ Creating authors...");
    const authors = await Author.insertMany([
      { MaTacGia: "TG001", TenTacGia: "Nguyễn Nhật Ánh" },
      { MaTacGia: "TG002", TenTacGia: "Nam Cao" },
      { MaTacGia: "TG003", TenTacGia: "Tô Hoài" },
    ]);
    console.log("✔ Authors created.");

    const authorMap = {};
    authors.forEach((a) => {
      authorMap[a.MaTacGia] = a._id;
    });

    // ====================== CATEGORIES ======================
    console.log("\n🏷 Creating categories...");
    const categories = await Category.insertMany([
      { MaTheLoai: "TL001", TenTheLoai: "Văn học" },
      { MaTheLoai: "TL002", TenTheLoai: "Thiếu nhi" },
      { MaTheLoai: "TL003", TenTheLoai: "Tiểu thuyết" },
    ]);
    console.log("✔ Categories created.");

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.MaTheLoai] = c._id;
    });

    // ====================== BOOKS ======================
    console.log("\n📘 Creating books...");
    await Book.insertMany([
      {
        MaSach: "S001",
        TenSach: "Mắt Biếc",
        MaTheLoai: categoryMap["TL001"],
        DonGia: 85000,
        SoQuyen: 10,
        NamXuatBan: 2019,
        MaNXB: publisherMap["NXB001"],
        MaTacGia: authorMap["TG001"],
        MoTa: "Tác phẩm nổi tiếng của Nguyễn Nhật Ánh",
      },
      {
        MaSach: "S002",
        TenSach: "Dế Mèn Phiêu Lưu Ký",
        MaTheLoai: categoryMap["TL002"],
        DonGia: 60000,
        SoQuyen: 12,
        NamXuatBan: 2010,
        MaNXB: publisherMap["NXB002"],
        MaTacGia: authorMap["TG003"],
        MoTa: "Tác phẩm thiếu nhi kinh điển",
      },
      {
        MaSach: "S003",
        TenSach: "Chí Phèo",
        MaTheLoai: categoryMap["TL001"],
        DonGia: 50000,
        SoQuyen: 8,
        NamXuatBan: 1941,
        MaNXB: publisherMap["NXB003"],
        MaTacGia: authorMap["TG002"],
        MoTa: "Tác phẩm hiện thực phê phán nổi tiếng",
      },
    ]);
    console.log("✔ Books created.");

    // ====================== BORROW RECORDS ======================
// ====================== BORROW RECORDS ======================
console.log("\n📄 Creating borrow records...");

const today = new Date();

// Helper: tạo ngày
const daysAgo = (n) => new Date(today.getTime() - n * 86400000);
const daysAfter = (n) => new Date(today.getTime() + n * 86400000);

await BorrowRecord.insertMany([

  // ========= 1) ĐÃ MƯỢN – CÒN HẠN =========
  {
    MaDocGia: "DG001",
    MaSach: "S001",
    NgayMuon: daysAgo(2),
    HanTra: daysAfter(28),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 0,
    MSNV: "NV002",
  },

  // ========= 2) ĐÃ MƯỢN – GẦN QUÁ HẠN =========
  {
    MaDocGia: "DG002",
    MaSach: "S002",
    NgayMuon: daysAgo(20),
    HanTra: daysAfter(1),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 1,
    MSNV: "NV002",
  },

  // ========= 3) ĐÃ MƯỢN – ĐÃ GIA HẠN 2 LẦN =========
  {
    MaDocGia: "DG001",
    MaSach: "S003",
    NgayMuon: daysAgo(30),
    HanTra: daysAfter(5),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 2,
    MSNV: "NV002",
  },

  // ========= 4) TRỄ HẠN – VỪA MỚI =========
  {
    MaDocGia: "DG002",
    MaSach: "S001",
    NgayMuon: daysAgo(20),
    HanTra: daysAgo(1),
    TrangThai: "Trễ hạn",
    TienPhat: 5000,
    MSNV: "NV002",
    LyDoXuPhat: "Trễ hạn 1 ngày",
  },

  // ========= 5) TRỄ HẠN – NẶNG (7 NGÀY) =========
  {
    MaDocGia: "DG001",
    MaSach: "S002",
    NgayMuon: daysAgo(40),
    HanTra: daysAgo(7),
    TrangThai: "Trễ hạn",
    TienPhat: 7 * 5000,
    MSNV: "NV002",
    LyDoXuPhat: "Trễ hạn 7 ngày",
  },

  // ========= 6) TRỄ HẠN – RẤT NẶNG (20 NGÀY) =========
  {
    MaDocGia: "DG002",
    MaSach: "S003",
    NgayMuon: daysAgo(60),
    HanTra: daysAgo(20),
    TrangThai: "Trễ hạn",
    TienPhat: 20 * 5000,
    MSNV: "NV002",
    LyDoXuPhat: "Trễ hạn 20 ngày",
  },

  // ========= 7) ĐÃ TRẢ – ĐÚNG HẠN =========
  {
    MaDocGia: "DG001",
    MaSach: "S001",
    NgayMuon: daysAgo(10),
    HanTra: daysAgo(3),
    NgayTra: daysAgo(3),
    TrangThai: "Đã trả",
    TienPhat: 0,
    MSNV: "NV002",
  },

  // ========= 8) ĐÃ TRẢ – TRỄ 2 NGÀY =========
  {
    MaDocGia: "DG001",
    MaSach: "S002",
    NgayMuon: daysAgo(20),
    HanTra: daysAgo(5),
    NgayTra: daysAgo(3),
    TrangThai: "Đã trả",
    TienPhat: 2 * 5000,
    LyDoXuPhat: "Trả trễ 2 ngày",
    MSNV: "NV002",
  },

  // ========= 9) ĐÃ TRẢ – GIA HẠN 1 LẦN =========
  {
    MaDocGia: "DG002",
    MaSach: "S003",
    NgayMuon: daysAgo(40),
    HanTra: daysAgo(10),
    NgayTra: daysAgo(10),
    TrangThai: "Đã trả",
    SoLanGiaHan: 1,
    TienPhat: 0,
    MSNV: "NV002",
  },

  // ========= 10) HƯ HỎNG NHẸ =========
  {
    MaDocGia: "DG001",
    MaSach: "S001",
    NgayMuon: daysAgo(15),
    HanTra: daysAfter(10),
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nhẹ",
    TienPhatHuHong: Math.round(85000 * 0.3),
    LyDoXuPhat: "Rách bìa nhẹ",
    MSNV: "NV002",
  },

  // ========= 11) HƯ HỎNG NẶNG =========
  {
    MaDocGia: "DG002",
    MaSach: "S002",
    NgayMuon: daysAgo(25),
    HanTra: daysAfter(5),
    TrangThai: "Hư hỏng",
    MucDoHuHong: "Nặng",
    TienPhatHuHong: Math.round(60000 * 0.7),
    LyDoXuPhat: "Nước đổ ướt nặng",
    MSNV: "NV002",
  },

  // ========= 12) MẤT SÁCH =========
  {
    MaDocGia: "DG001",
    MaSach: "S003",
    NgayMuon: daysAgo(30),
    HanTra: daysAgo(1),
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    TienPhatMatSach: 50000 + 50000, // 100% giá + phí xử lý
    LyDoXuPhat: "Làm rơi không tìm thấy",
    MSNV: "NV002",
  },

  // ========= 13) MẤT SÁCH – PHIÊN BẢN NẶNG =========
  {
    MaDocGia: "DG002",
    MaSach: "S001",
    NgayMuon: daysAgo(50),
    HanTra: daysAgo(10),
    TrangThai: "Mất sách",
    MucDoHuHong: "Mất",
    TienPhatMatSach: 85000 + 50000,
    LyDoXuPhat: "Bị mất trộm",
    MSNV: "NV002",
  },

  // ========= 14) ĐÃ MƯỢN – CHƯA GIA HẠN, SẮP QUÁ HẠN =========
  {
    MaDocGia: "DG001",
    MaSach: "S002",
    NgayMuon: daysAgo(25),
    HanTra: daysAfter(2),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 0,
    MSNV: "NV002",
  },

  // ========= 15) ĐÃ MƯỢN – ĐÃ GIA HẠN FULL 2 LẦN, CÒN HẠN =========
  {
    MaDocGia: "DG002",
    MaSach: "S003",
    NgayMuon: daysAgo(45),
    HanTra: daysAfter(10),
    TrangThai: "Đã mượn",
    SoLanGiaHan: 2,
    MSNV: "NV002",
  },

]);

console.log("✔ Borrow records created.");


    console.log("\n🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("──────────────────────────────");

    console.log("Login:");
    console.log("Admin:");
    console.log("  MSNV: NV001");
    console.log("  Password: 123456");
    console.log("");

    console.log("Reader:");
    console.log("  Email: an@example.com");
    console.log("  Password: 123456");

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
