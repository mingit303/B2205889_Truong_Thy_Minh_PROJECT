const authService = require("../services/auth.service");
const { success, error } = require("../utils/response");

exports.employeeLogin = async (req, res) => {
  try {
    const result = await authService.employeeLogin(req.body);
    return success(res, result, "Đăng nhập thành công");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.readerLogin = async (req, res) => {
  try {
    const result = await authService.readerLogin(req.body);
    return success(res, result, "Đăng nhập thành công");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.readerRegister = async (req, res) => {
  try {
    const result = await authService.readerRegister(req.body);
    return success(res, result, "Đăng ký thành công");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user);
    return success(res, user);
  } catch (err) {
    return error(res, err.message);
  }
};
