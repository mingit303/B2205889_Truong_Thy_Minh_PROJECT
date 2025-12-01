const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const upload = require("../middleware/upload");
const { authenticate, isEmployee } = require("../middleware/auth");

// Lấy danh sách / chi tiết (public hoặc sau này bạn thêm auth cũng được)
router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);

// Tạo sách
router.post(
  "/",
  authenticate,
  isEmployee,
  upload.single("AnhBia"),
  bookController.createBook
);

// Cập nhật sách
router.put(
  "/:id",
  authenticate,
  isEmployee,
  upload.single("AnhBia"),
  bookController.updateBook
);

// Xóa sách
router.delete(
  "/:id",
  authenticate,
  isEmployee,
  bookController.deleteBook
);



module.exports = router;
