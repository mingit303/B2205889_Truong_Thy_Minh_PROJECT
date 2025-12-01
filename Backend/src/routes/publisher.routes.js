const express = require("express");
const router = express.Router();
const publisherController = require("../controllers/publisher.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

// Public/Authenticated routes
router.get("/", publisherController.getPublishers);

// Employee only routes
router.post("/", authenticate, isEmployee, publisherController.createPublisher);
router.put("/:id", authenticate, isEmployee, publisherController.updatePublisher);
router.delete("/:id", authenticate, isEmployee, publisherController.deletePublisher);

module.exports = router;
