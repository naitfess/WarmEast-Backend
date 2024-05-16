require("dotenv").config();
const Cart = require("../model/Cart");
const User = require("../model/User");
const Warmindo = require("../model/Warmindo");
const Menu = require("../model/Menu");
const jwt = require("jsonwebtoken");
const CartProduct = require("../model/CartProduct");
const key = process.env.TOKEN_SECRET_KEY;

const getCartByUserId = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findAll({
      attributes: ["id"],
      include: [
        {
          model: User,
          attributes: ["fullName"],
        },
        {
          model: CartProduct,
          attributes: ["menuId", "quantity"],
          include: {
            model: Menu,
            attributes: ["name", "price"],
            include: {
              model: Warmindo,
              attributes: ["name", "address"],
            },
          },
        },
      ],
      where: {
        userId: loggedUser.id,
      },
    });

    if (!currentCart) {
      const error = new Error(
        `Cart with id_user ${loggedUser.id} is not existed`
      );
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch Cart data with id_user ${loggedUser.id}`,
      currentCart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postMenuToCart = async (req, res, next) => {
  try {
    const { id_menu, quantity } = req.body;
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const menu = await Menu.findOne({
      where: {
        id: id_menu,
      },
    });

    if (!menu) {
      const error = new Error(`Menu not with id ${id_menu} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findOne({
      where: {
        userId: loggedUser.id,
      },
    });

    const currentCartProduct = await CartProduct.create({
      quantity,
      cartId: currentCart.id,
      menuId: id_menu,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Add new menu to Cart successfull!",
      currentCartProduct,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteMenuInCart = async (req, res, next) => {
  try {
    const { id_menu } = req.params;
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const menu = await Menu.findOne({
      where: {
        id: id_menu,
      },
    });

    if (!menu) {
      const error = new Error(`Menu with id ${id_menu} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findOne({
      where: {
        userId: loggedUser.id,
      },
    });

    const currentCartProduct = await CartProduct.findOne({
      where: {
        menuId: id_menu,
        cartId: currentCart.id,
      },
    });

    if (!currentCartProduct) {
      const error = new Error(`You are not authorized to delete this menu`);
      error.statusCode = 403;
      throw error;
    }

    const targetedCartProduct = await CartProduct.destroy({
      where: {
        menuId: id_menu,
        cartId: currentCart.id,
      },
    });

    if (!targetedCartProduct) {
      const error = new Error(`Cart with id ${id_menu} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully delete menu in Cart data with id ${id_menu}`,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { menu_id } = req.params;
    const { quantity } = req.body;
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findOne({
      where: {
        userId: loggedUser.id,
      },
    });

    const currentCartProduct = await CartProduct.findOne({
      where: {
        menuId: menu_id,
        cartId: currentCart.id,
      },
    });

    if (currentCartProduct.cartId !== currentCart.id) {
      const error = new Error(`You are not authorized to update this menu`);
      error.statusCode = 403;
      throw error;
    }

    if (!currentCartProduct) {
      const error = new Error(`Cart with id ${menu_id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    await CartProduct.update(
      {
        quantity,
      },
      {
        where: {
          menuId: currentCartProduct.menuId,
          cartId: currentCart.id,
        },
      }
    );

    const updatedCartProduct = await CartProduct.findOne({
      where: {
        menuId: currentCartProduct.menuId,
        cartId: currentCart.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully update Cart data with id ${currentCartProduct.menuId}`,
      updatedCartProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getCartByUserId,
  postMenuToCart,
  updateCart,
  deleteMenuInCart,
};
