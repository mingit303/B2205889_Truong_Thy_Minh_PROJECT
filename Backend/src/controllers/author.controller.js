const authorService = require("../services/author.service");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");

// Lấy danh sách tác giả
const getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await authorService.getAuthors(page, limit, search);
    return paginate(res, result.authors, result.page, result.limit, result.total, "Lấy danh sách tác giả thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách tác giả", 500);
  }
};

// Tạo tác giả mới
const createAuthor = async (req, res) => {
  try {
    const newAuthor = await authorService.createAuthor(req.body);
    emitSocketEvent(SOCKET_EVENTS.AUTHOR_ADDED, newAuthor);
    return success(res, newAuthor, "Tạo tác giả mới thành công", 201);
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi tạo tác giả mới", 500);
  }
};

// Cập nhật tác giả
const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await authorService.updateAuthor(id, req.body);
    emitSocketEvent(SOCKET_EVENTS.AUTHOR_UPDATED, author);
    return success(res, author, "Cập nhật tác giả thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi cập nhật tác giả", 500);
  }
};

// Xóa tác giả
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    await authorService.deleteAuthor(id);
    emitSocketEvent(SOCKET_EVENTS.AUTHOR_DELETED, { _id: id });
    return success(res, null, "Xóa tác giả thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi xóa tác giả", 500);
  }
};

module.exports = {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
