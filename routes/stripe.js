const Order = require("../models/Order");
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const domain = process.env.stripeDomain;

// const domain = "http://localhost:3000"

router.post("/payment", async (req, res) => {
  if (req.body.products.length == 0) {
    res.status(200).json("Cart shouldn't be empty");
    return;
  }

  if (req.body.products.length > 1) {
    res
      .status(200)
      .json(
        "The mehtod used for this project limits the purchase to one item. The customer metadata doesn't accept more than 500 characters :( ."
      );
    return;
  }
  const customer = await stripe.customers.create({
    metadata: {
      products: JSON.stringify(req.body.products),
      userId: req.body.userId,
      username: req.body.username,
      quantity: req.body.quantity,
      total: req.body.total,
    },
  });

  const line_items = req.body.products.map((product) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          images: [product.img],
          metadata: {
            id: product._id,
          },
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    };
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: { allowed_countries: ["RO"] },
    shipping_options: [
      {
        shipping_rate_data: {
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Free shipping",
          type: "fixed_amount",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 3 },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    customer: customer.id,
    line_items,
    mode: "payment",
    success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/cart`,
  });

  res.status(200).json({ url: session.url });
});

//stripe webhook

const createOrder = async (customer, data) => {
  const products = JSON.parse(customer.metadata.products);

  const newOrder = new Order({
    userId: customer.metadata.userId,
    username: customer.metadata.username,
    paymentIndentId: data.payment_indent,
    products: products,
    total: customer.metadata.total,
    quantity: customer.metadata.quantity,
    customerDetails: data.customer_details,
  });

  try {
    const savedOrder = await newOrder.save();
  } catch (error) {
    console.log(error);
  }
};

const endpointSecret = process.env.webhook;

router.post("/webhook", async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;
  let data;
  try {
    event = stripe.webhooks.constructEvent(
      request["rawBody"],
      sig,
      endpointSecret
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  data = event.data.object;

  if (event.type === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        createOrder(customer, data);
      })
      .catch((err) => console.log(err));
  }

  response.json({ received: true });
});

module.exports = router;
