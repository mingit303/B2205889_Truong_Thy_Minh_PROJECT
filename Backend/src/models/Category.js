const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    MaTheLoai: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TenTheLoai: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
categorySchema.index({ MaTheLoai: 1 });

const Category = mongoose.model("Category", categorySchema, "TheLoai");

module.exports = Category;
