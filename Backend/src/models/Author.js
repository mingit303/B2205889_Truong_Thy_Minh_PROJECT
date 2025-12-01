const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
  MaTacGia: { type: String, required: true, unique: true },
  TenTacGia: String
});

module.exports = mongoose.model("Author", AuthorSchema, "TacGia");
