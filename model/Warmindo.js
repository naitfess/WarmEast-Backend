const Sequelize = require("sequelize");
const my_db = require('../util/connect_db');

const Warmindo = my_db.define("warmindos",{
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  name:{
    type: Sequelize.STRING,
    allowNull: false
  },
  address:{
    type: Sequelize.TEXT,
    allowNull: true
  },
  picture:{
    type: Sequelize.TEXT,
    allowNull: true
  }
})

module.exports = Warmindo;