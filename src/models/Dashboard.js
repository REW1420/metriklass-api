const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DashboardSchema = new Schema({
  user_id: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    trim: true,
  },
  count: {
    type: Number,
    trim: true,
  },
});

module.exports = mongoose.model("Dashboard", DashboardSchema);
