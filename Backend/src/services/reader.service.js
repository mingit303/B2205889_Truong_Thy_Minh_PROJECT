const Reader = require("../models/Reader");
const bcrypt = require("bcrypt");

class ReaderService {
  // Lấy danh sách độc giả + lọc
  async getReaders({ page = 1, limit = 10, search = "", gender, status }) {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;
    const query = {};

    // SEARCH
    if (search) {
      query.$or = [
        { MaDocGia: { $regex: search, $options: "i" } },
        { HoLot: { $regex: search, $options: "i" } },
        { Ten: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
      ];
    }

    // FILTER GENDER
    if (gender) {
      query.Phai = gender;
    }

    // FILTER STATUS
    if (status !== undefined && status !== "") {
      query.TrangThai = Number(status);
    }

    const readers = await Reader.find(query)
      .select("-MatKhau")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Reader.countDocuments(query);

    return { readers, total, page, limit };
  }

  // Lấy 1 độc giả
  async getReaderById(id) {
    return await Reader.findOne({ MaDocGia: id }).select("-MatKhau");
  }

  // Tạo độc giả mới
  async createReader(data) {
    if (!data.MaDocGia || !data.Email || !data.MatKhau || !data.Ten) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const existed = await Reader.findOne({ MaDocGia: data.MaDocGia });
    if (existed) throw new Error("Mã độc giả đã tồn tại");

    data.MatKhau = await bcrypt.hash(data.MatKhau, 10);

    const created = await Reader.create(data);

    const plain = created.toObject();
    delete plain.MatKhau;
    return plain;
  }

  // Cập nhật độc giả
  async updateReader(id, data) {
    const reader = await Reader.findOne({ MaDocGia: id });
    if (!reader) return null;

    const fields = ["HoLot", "Ten", "NgaySinh", "Phai", "DiaChi", "DienThoai", "Email"];
    fields.forEach((f) => {
      if (data[f] !== undefined) reader[f] = data[f];
    });

    if (data.MatKhau) {
      reader.MatKhau = await bcrypt.hash(data.MatKhau, 10);
    }

    await reader.save();

    const plain = reader.toObject();
    delete plain.MatKhau;

    return plain;
  }

  // Toggle trạng thái (Khóa / Mở khóa)
  async toggleReaderStatus(id) {
    const reader = await Reader.findOne({ MaDocGia: id });
    if (!reader) return null;

    reader.TrangThai = reader.TrangThai === 1 ? 0 : 1;
    await reader.save();

    const data = reader.toObject();
    delete data.MatKhau;

    return data;
  }

  // Xóa độc giả
  async deleteReader(id) {
    const existed = await Reader.findOne({ MaDocGia: id });
    if (!existed) return null;

    await Reader.deleteOne({ MaDocGia: id });
    return true;
  }
}

module.exports = new ReaderService();
