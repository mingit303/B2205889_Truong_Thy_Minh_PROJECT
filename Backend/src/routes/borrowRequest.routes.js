const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/borrowRequest.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// Chỉ dành cho nhân viên
router.get("/", authenticate, isEmployee, ctrl.getAll);
router.put("/:id/approve", authenticate, isEmployee, ctrl.approve);
router.put("/:id/reject", authenticate, isEmployee, ctrl.reject);

module.exports = router;
