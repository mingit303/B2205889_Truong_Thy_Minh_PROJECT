const service = require("../services/borrowRequest.service");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

// Lấy tất cả yêu cầu (dành cho nhân viên)
exports.getAll = async (req, res) => {
  try {
    const rs = await service.getAll(req.query);
    return paginate(res, rs.items, rs.page, rs.limit, rs.total);
  } catch (err) {
    return error(res, err.message);
  }
};

// Duyệt yêu cầu
exports.approve = async (req, res) => {
  try {
    const result = await service.approve(req.params.id, req.user.id);
    emitSocketEvent(SOCKET_EVENTS.REQUEST_UPDATED, result);
    return success(res, result, "Duyệt yêu cầu thành công");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// Từ chối yêu cầu
exports.reject = async (req, res) => {
  try {
    const result = await service.reject(req.params.id, req.body.reason);
    emitSocketEvent(SOCKET_EVENTS.REQUEST_UPDATED, result);
    return success(res, result, "Từ chối yêu cầu thành công");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
