const Order = require("../models/Order");
const router = require("express").Router();

const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// // Create order
// router.post("/", async (req, res) => {
//   const newOrder = new Order(req.body);
//   try {
//     const savedOrder = await newOrder.save();
//     res.status(200).json(savedOrder);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// Update order (admin)
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put(
  "/changeStatus/:userId/:id",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const updatedStatus = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
          status: "canceled",
        },
      });
      res.status(200).json(updatedStatus);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Delete order (admin)
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete(req.params.id);
    res.status(200).json(deletedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get users's orders
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all orders (admim)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const allOrders = await Order.find();
    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get users order

router.get("/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const allOrders = await Order.find({ userId: req.params.userId });
    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Stats : monthly income

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
