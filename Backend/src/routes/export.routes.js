const router = require("express").Router();
const exportController = require("../controllers/export.controller");
const { authenticate, isEmployee } = require("../middleware/auth");

router.get("/borrows", authenticate, isEmployee, exportController.exportBorrowRecords);
router.get("/fines", authenticate, isEmployee, exportController.exportFines);

module.exports = router;
