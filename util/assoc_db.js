require("dotenv").config();
const Cart = require("../model/Cart");
const CartProduct = require("../model/CartProduct");
const Category = require("../model/Category");
const Menu = require("../model/Menu");
const Order = require("../model/Order");
const OrderItem = require("../model/OrderItem");
const User = require("../model/User");
const Warmindo = require("../model/Warmindo");
const my_db = require("./connect_db");

//one to many Warmindo to Menu
Warmindo.hasMany(Menu);
Menu.belongsTo(Warmindo);

//one to one warmindo to user
Warmindo.hasOne(User);
User.belongsTo(Warmindo);
Warmindo.belongsTo(User);

//one to many Category to Menu
Category.hasMany(Menu);
Menu.belongsTo(Category);

//one to many User to Cart
User.hasMany(Cart);
Cart.belongsTo(User);

//one to many User to Order
User.hasMany(Order);
Order.belongsTo(User);

//one to many Cart to Cart Product
Cart.hasMany(CartProduct);
CartProduct.belongsTo(Cart);

//one to many Menu to Cart Product
Menu.hasMany(CartProduct);
CartProduct.belongsTo(Menu);

//one to many Order to Order Item
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

//one to many Menu to Order Item
Menu.hasMany(OrderItem);
OrderItem.belongsTo(Menu);

const makanan = {
  id: 1,
  name: "Makanan",
};

const minuman = {
  id: 2,
  name: "Minuman",
};

const association = async () => {
  try {
    await my_db.sync({ force: false });
    // await Category.create(makanan);
    // await Category.create(minuman);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
