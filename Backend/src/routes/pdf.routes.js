// src/routes/pdf.routes.js
const express = require("express");
const router = express.Router();
const pdf = require("../controllers/pdf.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// chỉ nhân viên được in
router.get("/borrow/:id", pdf.printBorrowTicket);
router.get("/fine/:id", pdf.printFineTicket);
router.get("/statistics/overview", pdf.printOverviewStatistics);
router.get("/statistics/top", pdf.printTopStatistics);
router.get("/statistics/borrow-return", pdf.printBorrowReturnStatistics);
router.get("/statistics/status", pdf.printStatusStatistics);
router.get("/statistics/fines", pdf.printFinesStatistics);

module.exports = router;
