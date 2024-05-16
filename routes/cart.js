const express = require("express");
const {
  getCartByUserId,
  postMenuToCart,
  updateCart,
  deleteMenuInCart,
} = require("../controller/cart");
const router = express.Router();

//get cart by user id
router.get("/api/carts/getcart", getCartByUserId);

//post menu to cart
router.post("/api/carts/postcart", postMenuToCart);

//update cart
router.put("/api/carts/:menu_id", updateCart);

//delete cart
router.delete("/api/carts/:id_menu", deleteMenuInCart);

module.exports = router;
