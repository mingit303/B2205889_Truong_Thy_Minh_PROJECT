// Validation helpers

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

const validateRequired = (fields, data) => {
  const errors = [];
  
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors.push(`${field} là bắt buộc`);
    }
  });
  
  return errors;
};

const validateBookData = (req, res, next) => {
  const { MaSach, TenSach, SoQuyen } = req.body;
  const errors = [];

  if (!MaSach || MaSach.trim() === "") {
    errors.push("Mã sách là bắt buộc");
  }

  if (!TenSach || TenSach.trim() === "") {
    errors.push("Tên sách là bắt buộc");
  }

  if (SoQuyen === undefined || SoQuyen < 0) {
    errors.push("Số quyển phải là số không âm");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors
    });
  }

  next();
};

const validateReaderData = (req, res, next) => {
  const { MaDocGia, Ten, Email, MatKhau } = req.body;
  const errors = [];

  if (!MaDocGia || MaDocGia.trim() === "") {
    errors.push("Mã độc giả là bắt buộc");
  }

  if (!Ten || Ten.trim() === "") {
    errors.push("Tên là bắt buộc");
  }

  if (!Email || !validateEmail(Email)) {
    errors.push("Email không hợp lệ");
  }

  // Chỉ validate mật khẩu khi tạo mới (POST)
  if (req.method === "POST") {
    if (!MatKhau || MatKhau.length < 6) {
      errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors
    });
  }

  next();
};

const validateBorrowData = (req, res, next) => {
  const { MaDocGia, MaSach } = req.body;
  const errors = [];

  if (!MaDocGia || MaDocGia.trim() === "") {
    errors.push("Mã độc giả là bắt buộc");
  }

  if (!MaSach || MaSach.trim() === "") {
    errors.push("Mã sách là bắt buộc");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors
    });
  }

  next();
};

const validateLoginData = (req, res, next) => {
  const { MSNV, Email, Password, MatKhau } = req.body;
  const errors = [];

  // Check employee login
  if (req.path.includes("employee")) {
    if (!MSNV || MSNV.trim() === "") {
      errors.push("MSNV là bắt buộc");
    }
    if (!Password || Password.trim() === "") {
      errors.push("Password là bắt buộc");
    }
  }

  // Check reader login
  if (req.path.includes("reader") && req.path.includes("login")) {
    if (!Email || !validateEmail(Email)) {
      errors.push("Email không hợp lệ");
    }
    if (!MatKhau || MatKhau.trim() === "") {
      errors.push("Mật khẩu là bắt buộc");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRequired,
  validateBookData,
  validateReaderData,
  validateBorrowData,
  validateLoginData
};
