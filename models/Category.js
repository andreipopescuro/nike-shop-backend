const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  title: {
    type: String,
    unique: true,
  },
  img: String,
  articleType: [
    {
      img: String,
      title: String,
      articole: [
        {
          title: String,
          desc: String,
          price: Number,
          img: String,
        },
      ],
    },
    {
      img: String,
      title: String,
      articole: [
        {
          title: String,
          desc: String,
          price: Number,
          img: String,
        },
      ],
    },
    {
      img: String,
      title: String,
      articole: [
        {
          title: String,
          desc: String,
          price: Number,
          img: String,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Categories", categoriesSchema);
