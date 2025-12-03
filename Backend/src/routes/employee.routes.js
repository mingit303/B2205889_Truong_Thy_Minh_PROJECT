const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { authenticate, isSuperAdmin } = require("../middleware/auth");

// PROFILE (cho bất kỳ employee nào đã đăng nhập)
router.get("/me", authenticate, employeeController.getProfile);
router.put("/me", authenticate, employeeController.updateProfile);
router.put("/change-password", authenticate, employeeController.changePassword);

router.get("/", authenticate, isSuperAdmin, employeeController.getEmployees);
router.post("/", authenticate, isSuperAdmin, employeeController.createEmployee);
router.put("/:id", authenticate, isSuperAdmin, employeeController.updateEmployee);

// FIXED — FE EXPECTS PATCH
router.patch("/:id/toggle-status", authenticate, isSuperAdmin, employeeController.toggleStatus);

router.delete("/:id", authenticate, isSuperAdmin, employeeController.deleteEmployee);

module.exports = router;
