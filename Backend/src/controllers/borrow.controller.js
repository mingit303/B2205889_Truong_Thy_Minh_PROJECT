// src/controllers/borrow.controller.js
const service = require("../services/borrow.service");
const { success, error, paginate } = require("../utils/response");

/* ======================================================
   EMPLOYEE — LIST
====================================================== */
exports.getBorrowRecords = async (req, res) => {
  try {
    const result = await service.getBorrowRecords(req.query);

    return paginate(
      res,
      result.records,
      result.page,
      result.limit,
      result.total,
      "Lấy danh sách phiếu mượn thành công"
    );
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách", 500);
  }
};

/* ======================================================
   EMPLOYEE — CREATE
====================================================== */
exports.createBorrowRecord = async (req, res) => {
  try {
    const record = await service.createBorrowRecord(req.body, req.user.id);
    return success(res, record, "Tạo phiếu mượn thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi tạo phiếu mượn", 400);
  }
};

/* ======================================================
   EMPLOYEE — RETURN
====================================================== */
exports.returnBook = async (req, res) => {
  try {
    const record = await service.returnBook(req.params.id);
    return success(res, record, "Trả sách thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi trả sách", 400);
  }
};

/* ======================================================
   EMPLOYEE — EXTEND
====================================================== */
exports.extendBorrow = async (req, res) => {
  try {
    const record = await service.extendBorrow(req.params.id);
    return success(res, record, "Gia hạn thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi gia hạn", 400);
  }
};

/* ======================================================
   EMPLOYEE — DAMAGED
====================================================== */
exports.reportDamaged = async (req, res) => {
  try {
    const record = await service.reportDamaged(req.params.id, req.body);
    return success(res, record, "Đã ghi nhận sách hư hỏng");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi ghi nhận hư hỏng", 400);
  }
};

/* ======================================================
   EMPLOYEE — LOST
====================================================== */
exports.reportLost = async (req, res) => {
  try {
    const record = await service.reportLost(req.params.id, req.body);
    return success(res, record, "Đã ghi nhận mất sách");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi ghi nhận mất sách", 400);
  }
};

/* ======================================================
   EMPLOYEE — MARK PAID
====================================================== */
exports.markPaid = async (req, res) => {
  try {
    const record = await service.markPaid(req.params.id);
    return success(res, record, "Đã bồi thường");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi đánh dấu bồi thường", 400);
  }
};

/* ======================================================
   READER — HISTORY
   req.user.id = MaDocGia
====================================================== */
exports.getMyBorrowHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await service.getMyBorrowHistory(req.user.id, {
      page,
      limit,
    });

    return paginate(
      res,
      result.records,
      result.page,
      result.limit,
      result.total,
      "Lấy lịch sử mượn thành công"
    );
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy lịch sử mượn", 500);
  }
};

/* ======================================================
   EMPLOYEE — OVERDUE LIST
====================================================== */
exports.getOverdueRecords = async (req, res) => {
  try {
    const list = await service.getOverdueRecords();
    return success(res, list, "Lấy danh sách trễ hạn thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách trễ hạn", 500);
  }
};
