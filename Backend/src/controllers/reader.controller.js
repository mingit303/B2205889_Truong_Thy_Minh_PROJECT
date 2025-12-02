const readerService = require("../services/reader.service");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

exports.getReaders = async (req, res) => {
  try {
    const result = await readerService.getReaders(req.query);

    return paginate(
      res,
      result.readers,
      result.page,
      result.limit,
      result.total,
      "Lấy danh sách độc giả thành công"
    );
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getReaderById = async (req, res) => {
  try {
    const reader = await readerService.getReaderById(req.params.id);
    if (!reader) return error(res, "Không tìm thấy độc giả", 404);

    return success(res, reader, "Lấy thông tin độc giả thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createReader = async (req, res) => {
  try {
    const created = await readerService.createReader(req.body);
    emitSocketEvent(SOCKET_EVENTS.READER_ADDED, created);
    return success(res, created, "Thêm độc giả thành công", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateReader = async (req, res) => {
  try {
    const updated = await readerService.updateReader(req.params.id, req.body);

    if (!updated) return error(res, "Không tìm thấy độc giả", 404);

    emitSocketEvent(SOCKET_EVENTS.READER_UPDATED, updated);
    return success(res, updated, "Cập nhật độc giả thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.toggleReaderStatus = async (req, res) => {
  try {
    const updated = await readerService.toggleReaderStatus(req.params.id);
    if (!updated) return error(res, "Không tìm thấy độc giả", 404);

    emitSocketEvent(SOCKET_EVENTS.READER_UPDATED, updated);
    return success(res, updated, "Đổi trạng thái thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteReader = async (req, res) => {
  try {
    const deleted = await readerService.deleteReader(req.params.id);
    if (!deleted) return error(res, "Không tìm thấy độc giả", 404);

    emitSocketEvent(SOCKET_EVENTS.READER_DELETED, { _id: req.params.id });
    return success(res, null, "Xóa độc giả thành công");
  } catch (err) {
    return error(res, err.message);
  }
};
