const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      default: "not logged",
    },
    username: {
      type: String,
      default: "not logged",
    },

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
    customerDetails: Object,
    paymentIndentId: String,
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
