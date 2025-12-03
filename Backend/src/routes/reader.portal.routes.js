const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reader.portal.controller");
const { readerAuth } = require("../middleware/auth");

// AUTH
router.post("/auth/register", ctrl.register);
router.post("/auth/login", ctrl.login);

// PROFILE
router.get("/me", readerAuth, ctrl.getProfile);
router.put("/me", readerAuth, ctrl.updateProfile);
router.put("/change-password", readerAuth, ctrl.changePassword);

// BOOKS
router.get("/books", ctrl.getBooks);

// CART
router.get("/cart", readerAuth, ctrl.getCart);
router.post("/cart/add", readerAuth, ctrl.addToCart);
router.delete("/cart/remove/:id", readerAuth, ctrl.removeFromCart);
router.delete("/cart/clear", readerAuth, ctrl.clearCart);
// PUBLIC FILTER OPTIONS (Dropdown)
router.get("/authors", require("../controllers/author.controller").getAuthors);
router.get("/publishers", require("../controllers/publisher.controller").getPublishers);
router.get("/categories", require("../controllers/category.controller").getAllCategories);
// BORROW REQUEST
router.post("/request", readerAuth, ctrl.createBorrowRequest);
router.get("/request/my", readerAuth, ctrl.getMyRequests);

// HISTORY
router.get("/history", readerAuth, ctrl.getMyBorrowHistory);

module.exports = router;
