// src/routes/statistics.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/statistics.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// Chỉ admin / nhân viên xem thống kê
router.get("/overview", authenticate, isEmployee, ctrl.getOverview);
router.get("/top-books", authenticate, isEmployee, ctrl.getTopBooks);
router.get("/top-readers", authenticate, isEmployee, ctrl.getTopReaders);
router.get("/borrow-return", authenticate, isEmployee, ctrl.getBorrowReturn);
router.get("/fines", authenticate, isEmployee, ctrl.getFines);
router.get("/status-distribution", authenticate, isEmployee, ctrl.getStatusDistribution);
router.get("/damaged-lost-books", authenticate, isEmployee, ctrl.getDamagedAndLostBooks);

module.exports = router;
