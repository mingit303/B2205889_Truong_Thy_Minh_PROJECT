const express = require("express");
const router = express.Router();
const configController = require("../controllers/config.controller");
const { authenticate, isSuperAdmin } = require("../middleware/auth");

// Public (hoặc authenticate) - lấy config
router.get("/", configController.getConfigs);

// SuperAdmin only
router.post("/", authenticate, isSuperAdmin, configController.updateConfig);
router.post("/init", authenticate, isSuperAdmin, configController.initDefaultConfigs);

module.exports = router;
