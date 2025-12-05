// src/controllers/statistics.controller.js
const service = require("../services/statistics.service");
const { success, error } = require("../utils/response");

exports.getOverview = async (req, res) => {
  try {
    const data = await service.getOverview();
    return success(res, data, "Lấy thống kê tổng quan thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy thống kê tổng quan", 500);
  }
};

exports.getTopBooks = async (req, res) => {
  try {
    const data = await service.getTopBooks();
    return success(res, data, "Lấy top sách mượn nhiều nhất thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy top sách", 500);
  }
};

exports.getTopReaders = async (req, res) => {
  try {
    const data = await service.getTopReaders();
    return success(res, data, "Lấy top độc giả mượn nhiều nhất thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy top độc giả", 500);
  }
};

exports.getBorrowReturn = async (req, res) => {
  try {
    const { year } = req.query;
    const data = await service.getBorrowReturn(Number(year));
    return success(res, data, "Lấy thống kê mượn / trả theo tháng thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy thống kê mượn / trả", 500);
  }
};

exports.getFines = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await service.getFines({ month, year });
    return success(res, data, "Lấy thống kê tiền phạt thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy thống kê tiền phạt", 500);
  }
};

exports.getStatusDistribution = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await service.getStatusDistribution({ month, year });
    return success(res, data, "Lấy phân bố trạng thái mượn thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy phân bố trạng thái", 500);
  }
};

exports.getDamagedAndLostBooks = async (req, res) => {
  try {
    const data = await service.getDamagedAndLostBooks(req.query);
    return success(res, data, "Lấy danh sách sách hư hỏng/mất thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách sách hư hỏng/mất", 500);
  }
};
