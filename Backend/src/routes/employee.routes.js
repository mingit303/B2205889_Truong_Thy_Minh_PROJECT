const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { authenticate, isSuperAdmin } = require("../middleware/auth");

router.get("/", authenticate, isSuperAdmin, employeeController.getEmployees);
router.post("/", authenticate, isSuperAdmin, employeeController.createEmployee);
router.put("/:id", authenticate, isSuperAdmin, employeeController.updateEmployee);

// FIXED — FE EXPECTS PATCH
router.patch("/:id/toggle-status", authenticate, isSuperAdmin, employeeController.toggleStatus);

router.delete("/:id", authenticate, isSuperAdmin, employeeController.deleteEmployee);

module.exports = router;
