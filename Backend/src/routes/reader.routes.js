const express = require("express");
const router = express.Router();
const readerController = require("../controllers/reader.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// PUBLIC
router.get("/", readerController.getReaders);

// EMPLOYEE ONLY
router.get("/:id", authenticate, isEmployee, readerController.getReaderById);
router.post("/", authenticate, isEmployee, readerController.createReader);
router.put("/:id", authenticate, isEmployee, readerController.updateReader);

// TOGGLE — ĐÚNG METHOD GIÚP FIX LỖI 500
router.patch("/:id/toggle-status", authenticate, isEmployee, readerController.toggleReaderStatus);

router.delete("/:id", authenticate, isEmployee, readerController.deleteReader);

module.exports = router;
