const publisherService = require("../services/publisher.service");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

// Lấy danh sách nhà xuất bản
const getPublishers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await publisherService.getPublishers(page, limit, search);
    return paginate(res, result.publishers, result.page, result.limit, result.total, "Lấy danh sách nhà xuất bản thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách nhà xuất bản", 500);
  }
};

// Tạo nhà xuất bản mới
const createPublisher = async (req, res) => {
  try {
    const newPublisher = await publisherService.createPublisher(req.body);
    emitSocketEvent(SOCKET_EVENTS.PUBLISHER_ADDED, newPublisher);
    return success(res, newPublisher, "Tạo nhà xuất bản mới thành công", 201);
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi tạo nhà xuất bản mới", 500);
  }
};

// Cập nhật nhà xuất bản
const updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await publisherService.updatePublisher(id, req.body);
    emitSocketEvent(SOCKET_EVENTS.PUBLISHER_UPDATED, publisher);
    return success(res, publisher, "Cập nhật nhà xuất bản thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi cập nhật nhà xuất bản", 500);
  }
};

// Xóa nhà xuất bản
const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    await publisherService.deletePublisher(id);
    emitSocketEvent(SOCKET_EVENTS.PUBLISHER_DELETED, { _id: id });
    return success(res, null, "Xóa nhà xuất bản thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi xóa nhà xuất bản", 500);
  }
};

module.exports = {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher
};
