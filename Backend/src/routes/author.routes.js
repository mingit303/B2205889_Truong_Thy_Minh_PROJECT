const express = require("express");
const router = express.Router();
const authorController = require("../controllers/author.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// Public/Authenticated routes
router.get("/", authorController.getAuthors);

// Employee only routes
router.post("/", authenticate, isEmployee, authorController.createAuthor);
router.put("/:id", authenticate, isEmployee, authorController.updateAuthor);
router.delete("/:id", authenticate, isEmployee, authorController.deleteAuthor);

module.exports = router;
