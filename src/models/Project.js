const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectName: {
    type: String,
    trim: true,
  },
  projectOwner: { type: String, trim: true },
  team: [{ id: { type: String, trim: true } }],
  mision: [
    {
      id: { type: String, trim: true },
      misionName: { type: String, trim: true },
      description: { type: String, trim: true },
      isFinished: { type: Boolean, trim: true },
      status: { type: String, trim: true },
    },
  ],
});

module.exports = mongoose.model("Project", ProjectSchema);
