const router = require("express").Router();

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const Cart = require("../models/Cart");

router.post("/", verifyToken, async (req, res) => {
  try {
    const existentCart = await Cart.find({ userId: req.body.userId });
    if (existentCart.length > 0) {
      try {
        const existendProduct = await Cart.findOne({
          userId: req.body.userId,
          "products._id": req.body.products._id,
        });

        if (existendProduct) {
          console.log(req.body.products.quantity);
          const updatedProduct = await Cart.updateOne(
            { userId: req.body.userId, "products._id": req.body.products._id },
            {
              $inc: {
                "products.$.quantity": req.body.products.quantity,
              },
              $set: {
                total: req.body.total,
              },
            }
          );
          res.status(200).json(updatedProduct);
        } else {
          const newProducts = await Cart.updateOne(
            { userId: req.body.userId },
            {
              $push: { products: req.body.products },
              $set: {
                total: req.body.total,
                quantity: req.body.quantity,
              },
            }
          );
          res.status(200).json(newProducts);
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      const newCart = new Cart(req.body);
      const savedNewCart = await newCart.save();
      res.status(200).json(savedNewCart);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedCart = await Cart.findOneAndDelete({ userId: req.params.id });
    res.status(200).json(deletedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/:userId/:id", async (req, res) => {
  try {
    const deletedProduct = await Cart.findOneAndUpdate(
      { userId: req.params.userId },

      {
        $pull: {
          products: { _id: req.params.id },
        },
        $inc: {
          total: -req.body.totalToDecrease,
          quantity: -1,
        },
      }
    );
    res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const allCarts = await Cart.find();
    res.status(200).json(allCarts);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
