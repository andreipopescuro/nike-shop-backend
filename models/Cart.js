const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    userId: String,
    username: String,
    products: [
      {
        title: String,
        _id: String,
        desc: String,
        price: Number,
        img: String,
        quantity: Number,
      },
    ],
    quantity: Number,
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
