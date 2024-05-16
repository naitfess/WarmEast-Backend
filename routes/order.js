const express = require("express");
const { getOrderByUserId, postOrder } = require("../controller/order");
const router = express.Router();

//get order by user id
router.get("/api/orders/getorder", getOrderByUserId);

//post menu to cart
router.post("/api/orders/postorder", postOrder);

module.exports = router;
