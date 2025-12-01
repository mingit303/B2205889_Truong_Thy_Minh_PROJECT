const ExcelJS = require("exceljs");
const BorrowRecord = require("../models/BorrowRecord");

exports.exportBorrowRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.find({})
      .populate("docgia")
      .populate("sach")
      .populate("nhanvien")
      .sort({ NgayMuon: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PhieuMuon");

    sheet.columns = [
      { header: "Mã DG", key: "MaDocGia", width: 12 },
      { header: "Tên độc giả", key: "TenDG", width: 25 },
      { header: "Mã sách", key: "MaSach", width: 12 },
      { header: "Tên sách", key: "TenSach", width: 30 },
      { header: "Ngày mượn", key: "NgayMuon", width: 15 },
      { header: "Hạn trả", key: "HanTra", width: 15 },
      { header: "Trạng thái", key: "TrangThai", width: 15 },
      { header: "Nhân viên", key: "NhanVien", width: 20 }
    ];

    records.forEach(r => {
      sheet.addRow({
        MaDocGia: r.MaDocGia,
        TenDG: `${r.docgia?.HoLot || ""} ${r.docgia?.Ten || ""}`,
        MaSach: r.MaSach,
        TenSach: r.sach?.TenSach || "",
        NgayMuon: new Date(r.NgayMuon).toLocaleDateString("vi-VN"),
        HanTra: new Date(r.HanTra).toLocaleDateString("vi-VN"),
        TrangThai: r.TrangThai,
        NhanVien: r.nhanvien?.HoTenNV || ""
      });
    });

    const fileName = `PhieuMuon_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi export Excel" });
  }
};
exports.exportFines = async (req, res) => {
  try {
    const records = await BorrowRecord.find({
      TrangThai: { $in: ["Trễ hạn", "Hư hỏng", "Mất sách"] }
    })
      .populate("docgia")
      .populate("sach")
      .populate("nhanvien")
      .sort({ updatedAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PhieuPhat");

    sheet.columns = [
      { header: "Mã DG", key: "MaDocGia", width: 12 },
      { header: "Tên độc giả", key: "TenDG", width: 25 },
      { header: "Mã sách", key: "MaSach", width: 12 },
      { header: "Tên sách", key: "TenSach", width: 30 },
      { header: "Trạng thái", key: "TrangThai", width: 15 },
      { header: "Tiền phạt", key: "TienPhat", width: 15 },
      { header: "Lý do", key: "LyDo", width: 30 },
      { header: "Nhân viên", key: "NhanVien", width: 20 }
    ];

    records.forEach(r => {
      sheet.addRow({
        MaDocGia: r.MaDocGia,
        TenDG: `${r.docgia?.HoLot} ${r.docgia?.Ten}`,
        MaSach: r.MaSach,
        TenSach: r.sach?.TenSach,
        TrangThai: r.TrangThai,
        TienPhat:
          r.TienPhat ||
          r.TienPhatHuHong ||
          r.TienPhatMatSach ||
          0,
        LyDo: r.LyDoXuPhat,
        NhanVien: r.nhanvien?.HoTenNV
      });
    });

    const fileName = `PhieuPhat_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi export fines Excel" });
  }
};
