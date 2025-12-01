const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const { error } = require("../utils/response");
const Employee = require("../models/Employee");
const Reader = require("../models/Reader");

// Middleware xác thực token
const authenticate = async (req, res, next) => {
 try {
    // ƯU TIÊN: header
    let token = req.headers.authorization?.split(" ")[1];

    // NẾU mở cửa sổ mới (PDF) → token nằm ở query
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return error(res, "Không tìm thấy token xác thực", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return error(res, "Token không hợp lệ hoặc hết hạn", 401);
  }
};

// Middleware kiểm tra quyền Employee (Admin/SuperAdmin)
const isEmployee = async (req, res, next) => {
  try {
    if (req.user.type !== "employee") {
      return error(res, "Chỉ nhân viên mới có quyền truy cập", 403);
    }

    const employee = await Employee.findOne({ MSNV: req.user.id });
    if (!employee || employee.TrangThai !== 1) {
      return error(res, "Tài khoản nhân viên không tồn tại hoặc đã bị khóa", 403);
    }

    req.employee = employee;
    next();
  } catch (err) {
    return error(res, "Lỗi xác thực nhân viên", 500);
  }
};

// Middleware kiểm tra quyền SuperAdmin
const isSuperAdmin = async (req, res, next) => {
  try {
    if (req.user.type !== "employee") {
      return error(res, "Chỉ nhân viên mới có quyền truy cập", 403);
    }

    const employee = await Employee.findOne({ MSNV: req.user.id });
    if (!employee || employee.VaiTro !== "SUPERADMIN") {
      return error(res, "Chỉ SuperAdmin mới có quyền thực hiện thao tác này", 403);
    }

    req.employee = employee;
    next();
  } catch (err) {
    return error(res, "Lỗi xác thực quyền", 500);
  }
};

// Middleware kiểm tra là Reader
const isReader = async (req, res, next) => {
  try {
    if (req.user.type !== "reader") {
      return error(res, "Chỉ độc giả mới có quyền truy cập", 403);
    }

    const reader = await Reader.findOne({ MaDocGia: req.user.id });
    if (!reader || reader.TrangThai !== 1) {
      return error(res, "Tài khoản độc giả không tồn tại hoặc đã bị khóa", 403);
    }

    req.reader = reader;
    next();
  } catch (err) {
    return error(res, "Lỗi xác thực độc giả", 500);
  }
};


readerAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Không có token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "reader")
      return res.status(403).json({ message: "Không hợp lệ" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = { authenticate, isEmployee, isSuperAdmin, isReader, readerAuth };
