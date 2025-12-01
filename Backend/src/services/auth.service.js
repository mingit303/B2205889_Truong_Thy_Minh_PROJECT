// services/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Reader = require("../models/Reader");
const { jwtSecret } = require("../config");

class AuthService {
  async employeeLogin({ MSNV, Password }) {
    const employee = await Employee.findOne({ MSNV });

    if (!employee) throw new Error("MSNV hoặc mật khẩu không đúng");
    if (employee.TrangThai !== 1) throw new Error("Tài khoản đã bị khóa");

    const isMatch = await bcrypt.compare(Password, employee.Password);
    if (!isMatch) throw new Error("MSNV hoặc mật khẩu không đúng");

    const token = jwt.sign(
      {
        id: employee.MSNV,
        type: "employee",
        role: employee.VaiTro
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        MSNV: employee.MSNV,
        HoTenNV: employee.HoTenNV,
        ChucVu: employee.ChucVu,
        VaiTro: employee.VaiTro
      }
    };
  }

  async readerLogin({ Email, MatKhau }) {
    const reader = await Reader.findOne({ Email });

    if (!reader) throw new Error("Email hoặc mật khẩu không đúng");
    if (reader.TrangThai !== 1) throw new Error("Tài khoản đã bị khóa");

    const isMatch = await bcrypt.compare(MatKhau, reader.MatKhau);
    if (!isMatch) throw new Error("Email hoặc mật khẩu không đúng");

    const token = jwt.sign(
      {
        id: reader.MaDocGia,
        type: "reader"
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        MaDocGia: reader.MaDocGia,
        HoLot: reader.HoLot,
        Ten: reader.Ten,
        Email: reader.Email
      }
    };
  }

  async readerRegister(data) {
    const { MaDocGia, Email, MatKhau, Ten } = data;

    if (!MaDocGia || !Email || !MatKhau || !Ten)
      throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");

    const existed = await Reader.findOne({
      $or: [{ Email }, { MaDocGia }]
    });

    if (existed) throw new Error("Email hoặc mã độc giả đã tồn tại");

    const hashed = await bcrypt.hash(MatKhau, 10);

    const newReader = await Reader.create({
      ...data,
      MatKhau: hashed,
      TrangThai: 1
    });

    return {
      MaDocGia: newReader.MaDocGia,
      Ten: newReader.Ten,
      Email: newReader.Email
    };
  }

  async getMe(user) {
    if (user.type === "employee") {
      return await Employee.findOne(
        { MSNV: user.id },
        "MSNV HoTenNV ChucVu DiaChi SoDienThoai VaiTro TrangThai"
      ).lean();
    }

    return await Reader.findOne(
      { MaDocGia: user.id },
      "MaDocGia HoLot Ten Email Phai DiaChi DienThoai TrangThai"
    ).lean();
  }
}

module.exports = new AuthService();
