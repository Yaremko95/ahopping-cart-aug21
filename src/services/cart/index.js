import { Router } from "express";
import db from "../../db/models/index.js";
import sequelize from "sequelize";
import Category from "../../db/models/Category.js";

const { Cart, Product } = db;
const router = Router();

// [
//   {
//     qty: 6,
//     ammount:90
//     productId: 2,
//   },
//   {
//     qty: 1,
//     productId: 3,
//   },
// ];

router.route("/:userId").get(async (req, res, next) => {
  try {
    const cart = await Cart.findAll({
      where: {
        userId: req.params.userId,
      },
      include: { model: Product, include: Category },
      attributes: [
        "productId",
        [sequelize.fn("COUNT", "productId"), "qty"],
        [sequelize.fn("SUM", sequelize.col("product.price")), "unitary_price"],
      ],

      group: ["productId", "product.id", "product.category.id"],
    });

    const totalQty = await Cart.count({
      where: {
        userId: req.params.userId,
      },
    });

    const totalPrice = await Cart.sum("product.price", {
      include: { model: Product, attributes: [] },
    });

    res.send({ cart, totalQty, totalPrice });
  } catch (error) {
    console.log(error);
  }
});

// router.route("/:userId").get(async (req, res, next) => {
//   try {
//     const data = await Cart.findAll({
//       where: { userId: req.params.userId },
//     });

//     const groupBy = await Cart.findAll({
//       attributes: ["productId", [sequelize.fn("COUNT", "id"), "unitary_qty"]],
//       where: {
//         userId: req.params.userId,
//       },
//       group: "productId",
//     });

//     const groupAndIcludeProduct = await Cart.findAll({
//       attributes: [
//         "productId",
//         [sequelize.fn("COUNT", "id"), "unitary_qty"],
//         [sequelize.fn("SUM", sequelize.col("product.price")), "unitary_price"],
//       ],
//       where: {
//         userId: req.params.userId,
//       },
//       include: { model: Product, attributes: ["name", "price"] },
//       group: ["productId", "product.id"],
//     });

//     const countAll = await Cart.count({
//       where: { userId: req.params.userId },
//     });

//     const sumAll = await Cart.sum("product.price", {
//       include: { model: Product, attributes: [] },
//       where: { userId: req.params.userId },
//     });

//     res.send({
//       products: groupAndIcludeProduct,
//       total: countAll,
//       totalPrice: sumAll,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

router
  .route("/:userId/:productId")
  .post(async (req, res, next) => {
    try {
      const { userId, productId } = req.params;
      const data = await Cart.create({ userId, productId });
      res.send(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { userId, productId } = req.params;
      const rows = await Cart.destroy({ where: { userId, productId } });
      res.send({ rows });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

export default router;
