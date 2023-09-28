const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  id: {
    type: String,
    trim: true,
  },
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
  bornDate: {
    type: String,
    trim: true,
  },
  profilePhoto: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
