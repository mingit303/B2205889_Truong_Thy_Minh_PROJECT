const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
  Ten: { type: String, unique: true },
  GiaTri: String
});

module.exports = mongoose.model("Config", ConfigSchema, "CauHinh");
