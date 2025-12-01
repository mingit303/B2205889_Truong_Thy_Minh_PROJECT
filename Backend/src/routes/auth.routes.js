const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { validateLoginData, validateReaderData } = require("../validators");

// Public routes
router.post("/employee/login", validateLoginData, authController.employeeLogin);
router.post("/reader/login", validateLoginData, authController.readerLogin);
router.post("/reader/register", validateReaderData, authController.readerRegister);

// Protected routes
router.get("/me", authenticate, authController.getMe);

module.exports = router;
