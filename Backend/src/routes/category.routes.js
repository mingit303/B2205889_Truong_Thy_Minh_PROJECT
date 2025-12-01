const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// Public routes
router.get("/", categoryController.getCategories);
router.get("/all", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected routes - Employee only
router.use(authenticate);
router.use(isEmployee);

router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
