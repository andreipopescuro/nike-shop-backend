const { ObjectId } = require("mongodb");
const Category = require("../models/Category");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//Create category

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newCategory = new Category(req.body);

  try {
    const savedCategory = await newCategory.save();
    res.status(200).json(savedCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Add new product
router.post("/addProduct", verifyTokenAndAdmin, async (req, res) => {
  try {
    const newProduct = await Category.updateOne(
      { title: req.body.catTitle },
      {
        $push: {
          "articleType.$[i].articole": {
            title: req.body.articleTitle,
            desc: req.body.articleDesc,
            price: req.body.articlePrice,
            img: req.body.articleImg,
          },
        },
      },
      {
        arrayFilters: [{ "i.title": req.body.title }],
      }
    );
    res.status(200).json(newProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete a product by title, id category given
router.delete("/deleteProduct", verifyTokenAndAdmin, async (req, res) => {
  try {
    const deletedProduct = await Category.updateOne(
      { title: req.body.catTitle },
      {
        $pull: {
          "articleType.$[i].articole": {
            _id: req.body.id,
          },
        },
      },
      {
        arrayFilters: [{ "i.title": req.body.title }],
      }
    );
    res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update a product with id
router.put("/updateProduct/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const helper = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $match: {
          "articleType.articole._id": ObjectId(req.params.id),
        },
      },
    ]).then((response) => {
      const categoryId = response[0]._id;
      const articleTypeId = response[0].articleType._id;
      const objId = response[0].articleType.articole._id;
      const newProd = req.body;
      const up = async () => {
        const updatedProduct = await Category.findOneAndUpdate(
          {
            _id: categoryId,
          },
          {
            $set: {
              "articleType.$[art].articole.$[customArt]": {
                ...newProd,
                _id: objId,
              },
            },
          },
          {
            multi: false,
            upsert: false,
            arrayFilters: [
              {
                "art._id": {
                  $eq: articleTypeId,
                },
              },
              {
                "customArt._id": {
                  $eq: objId,
                },
              },
            ],
          }
        );
      };
      up();
    });

    res.status(200).json("ok");
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete a product with id
router.delete("/deleteProduct/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const helper = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $match: {
          "articleType.articole._id": ObjectId(req.params.id),
        },
      },
    ]);

    const catTitle = helper[0].title;
    const title = helper[0].articleType.title;
    const id = req.params.id;

    const deletedProduct = await Category.updateOne(
      { title: catTitle },
      {
        $pull: {
          "articleType.$[i].articole": {
            _id: id,
          },
        },
      },
      {
        arrayFilters: [{ "i.title": title }],
      }
    );
    res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get products from same artile type by id

router.get("/recommended", async (req, res) => {
  const query = req.query.itemId;
  try {
    const products = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $match: {
          "articleType.articole._id": ObjectId(query),
        },
      },
      {
        $project: {
          articole: "$articleType.articole",
        },
      },
    ]);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get a single product with id

router.get("/find", async (req, res) => {
  const query = req.query.itemId;
  try {
    const product = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $match: {
          "articleType.articole._id": ObjectId(query),
        },
      },
      {
        $project: {
          title: "$articleType.articole.title",
          _id: "$articleType.articole._id",
          desc: "$articleType.articole.desc",
          price: "$articleType.articole.price",
          img: "$articleType.articole.img",
        },
      },
    ]);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all products

router.get("/products", async (req, res) => {
  try {
    const allProducts = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $project: {
          title: "$articleType.articole.title",
          _id: "$articleType.articole._id",
          desc: "$articleType.articole.desc",
          price: "$articleType.articole.price",
          img: "$articleType.articole.img",
        },
      },
    ]);
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all products from a category
router.get("/products/:category", async (req, res) => {
  try {
    // const currentCategory = await Category.findOne({ cat });
    const currentCategory = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $match: {
          title: req.params.category,
        },
      },
      {
        $project: {
          title: "$articleType.articole.title",
          _id: "$articleType.articole._id",
          desc: "$articleType.articole.desc",
          price: "$articleType.articole.price",
          img: "$articleType.articole.img",
        },
      },
    ]);
    res.status(200).json(currentCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get 3 products from a category
router.get("/products/:category/limit", async (req, res) => {
  try {
    // const currentCategory = await Category.findOne({ cat });
    const currentCategory = await Category.aggregate([
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },
      {
        $match: {
          title: req.params.category,
        },
      },
      {
        $project: {
          title: "$articleType.articole.title",
          _id: "$articleType.articole._id",
          desc: "$articleType.articole.desc",
          price: "$articleType.articole.price",
          img: "$articleType.articole.img",
        },
      },
    ]).limit(3);
    res.status(200).json(currentCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get products filtered by category name and filter query
router.get("/products/:category/filtered", async (req, res) => {
  const cat = req.params.category;
  const query = req.query.type;
  try {
    const currentCategory = await Category.aggregate([
      {
        $match: {
          title: cat,
        },
      },
      {
        $unwind: "$articleType",
      },
      {
        $unwind: "$articleType.articole",
      },

      {
        $match: {
          "articleType.title": query,
        },
      },
      {
        $project: {
          title: "$articleType.articole.title",
          _id: "$articleType.articole._id",
          desc: "$articleType.articole.desc",
          price: "$articleType.articole.price",
          img: "$articleType.articole.img",
        },
      },
    ]);

    res.status(200).json(currentCategory);
  } catch (error) {
    res.status(500).json("nope");
  }
});

// Get a single category
router.get("/:category", async (req, res) => {
  const cat = req.params.category;
  try {
    const currentCategory = await Category.find({ title: cat });
    res.status(200).json(currentCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all categories

router.get("/", async (req, res) => {
  try {
    const allCategories = await Category.find();
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
