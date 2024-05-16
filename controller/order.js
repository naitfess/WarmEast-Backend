require("dotenv").config();
const Order = require("../model/Order");
const OrderItem = require("../model/OrderItem");
const User = require("../model/User");
const Cart = require("../model/Cart");
const Menu = require("../model/Menu");
const Warmindo = require("../model/Warmindo");
const jwt = require("jsonwebtoken");
const CartProduct = require("../model/CartProduct");
const key = process.env.TOKEN_SECRET_KEY;
//const cloudinary = require("../util/cloudinary_config");
//const fs = require("fs");

const getOrderByUserId = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentOrder = await Order.findAll({
      where: {
        userId: loggedUser.id,
      },
    });

    if (currentOrder.length === 0) {
      const error = new Error(
        `Order with userId ${loggedUser.id} is not existed`
      );
      error.statusCode = 400;
      throw error;
    }

    let currentOrderItems = [];
    for (let order of currentOrder) {
    const orderItems = await OrderItem.findAll({
    attributes: ["id", "quantity"],
    include: [
      {
        model: Order,
        attributes: ["total", "status", "date"],
        include: {
          model: User,
          attributes: ["id", "fullName"],
        },
      },
      {
        model: Menu,
        attributes: ["name", "price"],
        include: {
          model: Warmindo,
          attributes: ["name", "address"],
        },
      },
    ],
    where: {
      orderId: order.id,
    },
  });

  if (orderItems.length > 0) {
    currentOrderItems.push(...orderItems);
  }
}


    if (!currentOrderItems) {
      const error = new Error(
        `Order with userId ${loggedUser.id} is not existed`
      );
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch Order data with userId ${loggedUser.id}`,
      currentOrderItems,
      currentOrder
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postOrder = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findOne({
      where: {
        userId: loggedUser.id,
      },
    });

    const currentCartProduct = await CartProduct.findAll({
      include: {
        model: Menu,
        attributes: ["id", "name", "price"],
      },
      where: {
        cartId: currentCart.id,
      },
    });


    // Menghitung total dengan mengalikan kuantitas dengan harga setiap item di keranjang
    let total = 0;
    currentCartProduct.forEach((cartItem) => {
      total += cartItem.quantity * cartItem.menu.price;
    });

    const newOrder = await Order.create({
      total,
      status: "pending", // or any default status
      date: new Date(),
      userId: loggedUser.id,
    });

    // For each CartProduct, create new OrderItem with orderId from new Order and other details from CartProduct
    const orderItems = currentCartProduct.map((cartItem) => ({
      orderId: newOrder.id,
      menuId: cartItem.menu.id,
      quantity: cartItem.quantity,
    }));

    await OrderItem.bulkCreate(orderItems);

    // Clear the cart after placing order
    await CartProduct.destroy({
      where: {
        cartId: currentCart.id,
      },
    });

    res.status(201).json({
      status: "Success",
      message: "Order placed successfully",
      order: newOrder,
      OrderItems: orderItems,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getOrderByUserId,
  postOrder,
};
