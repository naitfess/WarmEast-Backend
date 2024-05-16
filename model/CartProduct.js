const Sequelize = require("sequelize");
const my_db = require("../util/connect_db");

const CartProduct = my_db.define("cartProducts", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = CartProduct;
