const Sequelize = require("sequelize");
const my_db = require('../util/connect_db');

const Category = my_db.define("categories",{
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name:{
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = Category;