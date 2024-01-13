const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAdminSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    trim: true,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserAdmin", UserAdminSchema);
