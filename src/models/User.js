const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
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

  profilePhoto: {
    type: String,
    trim: true,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  personalDocs: {
    DUI: {
      type: String,
      trim: true,
      default: null,
    },
    Antecedentes: {
      type: String,
      trim: true,
      default: null,
    },
    Solvencia: {
      type: String,
      trim: true,
      default: null,
    },
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
