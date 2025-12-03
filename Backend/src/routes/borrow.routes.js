// src/routes/borrow.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/borrow.controller");
const { authenticate, isEmployee, isReader } = require("../middleware/auth");

// EMPLOYEE
router.get("/", authenticate, isEmployee, ctrl.getBorrowRecords);
router.post("/", authenticate, isEmployee, ctrl.createBorrowRecord);
router.put("/:id/return", authenticate, isEmployee, ctrl.returnBook);
router.put("/:id/extend", authenticate, isEmployee, ctrl.extendBorrow);
router.put("/:id/report-damaged", authenticate, isEmployee, ctrl.reportDamaged);
router.put("/:id/report-lost", authenticate, isEmployee, ctrl.reportLost);
router.put("/:id/paid", authenticate, isEmployee, ctrl.markPaid);
router.put("/:id/confirm-fine-paid", authenticate, isEmployee, ctrl.confirmFinePaid);
router.get("/overdue", authenticate, isEmployee, ctrl.getOverdueRecords);

// READER
router.get("/my-history", authenticate, isReader, ctrl.getMyBorrowHistory);

module.exports = router;
