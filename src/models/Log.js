const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  severity: {
    type: String,
    enum: ["info", "warning", "error", "alert"],
    default: "info",
    trim: true,
  },

  origin: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Log", LogSchema);
