const Sequelize = require("sequelize");
const my_db = require("../util/connect_db");

const Menu = my_db.define("menus", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  picture: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

module.exports = Menu;
