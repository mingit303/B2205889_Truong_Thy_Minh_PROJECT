const bookService = require("../services/book.service");
const Book = require("../models/Book");
const { success, error, paginate } = require("../utils/response");
const { SOCKET_EVENTS, emitSocketEvent } = require("../config/socket");
const fs = require("fs");
const path = require("path");

exports.getBooks = async (req, res) => {
  try {
    const result = await bookService.getBooks(req.query);
    return paginate(
      res,
      result.books,
      result.page,
      result.limit,
      result.total,
      "Lấy danh sách sách thành công"
    );
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy danh sách sách");
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return error(res, "Không tìm thấy sách", 404);
    return success(res, book);
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi lấy chi tiết sách");
  }
};

exports.createBook = async (req, res) => {
  try {
    let imagePath = null;

    if (req.file) {
      imagePath = `${req.protocol}://${req.get(
        "host"
      )}/uploads/books/${req.file.filename}`;
    }

    const data = {
      ...req.body,
      AnhBia: imagePath,
    };

    const book = await bookService.createBook(data);

    // Emit socket event
    emitSocketEvent(SOCKET_EVENTS.BOOK_ADDED, book);

    return success(res, book, "Tạo sách thành công", 201);
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi tạo sách");
  }
};

exports.updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (!book) return error(res, "Không tìm thấy sách", 404);

    const baseUrl = `${req.protocol}://${req.get("host")}/`;
    const dataUpdate = { ...req.body };

    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (book.AnhBia) {
        const relative = book.AnhBia.replace(baseUrl, ""); // uploads/books/xxx.jpg
        const oldPath = path.join(process.cwd(), relative);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      dataUpdate.AnhBia = `${baseUrl}uploads/books/${req.file.filename}`;
    }

    const updated = await bookService.updateBook(id, dataUpdate);

    // Emit socket event
    emitSocketEvent(SOCKET_EVENTS.BOOK_UPDATED, updated);

    return success(res, updated, "Cập nhật sách thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi cập nhật sách");
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (!book) return error(res, "Không tìm thấy sách", 404);

    const baseUrl = `${req.protocol}://${req.get("host")}/`;

    if (book.AnhBia) {
      const relative = book.AnhBia.replace(baseUrl, "");
      const imgPath = path.join(process.cwd(), relative);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await book.deleteOne();

    // Emit socket event
    emitSocketEvent(SOCKET_EVENTS.BOOK_DELETED, { _id: id });

    return success(res, null, "Xóa sách thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Lỗi xóa sách");
  }
};
