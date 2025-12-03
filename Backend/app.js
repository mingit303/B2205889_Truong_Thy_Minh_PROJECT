const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const { mongoUri } = require("./src/config");
const errorHandler = require("./src/middleware/errorHandler");

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const bookRoutes = require("./src/routes/book.routes");
const borrowRoutes = require("./src/routes/borrow.routes");
const readerRoutes = require("./src/routes/reader.routes");
const employeeRoutes = require("./src/routes/employee.routes");
const configRoutes = require("./src/routes/config.routes");
const authorRoutes = require("./src/routes/author.routes");
const publisherRoutes = require("./src/routes/publisher.routes");
const categoryRoutes = require("./src/routes/category.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const statisticsRoutes = require("./src/routes/statistics.routes");
const exportRoutes = require("./src/routes/export.routes");
const pdfRoutes = require("./src/routes/pdf.routes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB(mongoUri);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Library Management API v1.0", status: "Running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/readers", readerRoutes);
app.use("/api/reader", require("./src/routes/reader.portal.routes"));
app.use("/api/employee", employeeRoutes); // Employee portal routes
app.use("/api/employees", employeeRoutes);
app.use("/api/config", configRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/requests", require("./src/routes/borrowRequest.routes"));

app.use("/uploads", express.static("uploads"));

// Error handler (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;
