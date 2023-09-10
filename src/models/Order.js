const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  id: {
    type: String,
    trim: true,
  },
  client: {
    type: String,
    trim: true,
  },
  totalPrice: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
