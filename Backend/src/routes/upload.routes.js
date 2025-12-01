const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const upload = require("../middleware/upload");
const { authenticate, isEmployee } = require("../middleware/auth");

// Employee only
router.post("/image", authenticate, isEmployee, upload.single("image"), uploadController.uploadImage);
router.delete("/image", authenticate, isEmployee, uploadController.deleteImage);

module.exports = router;
