const Sequelize = require("sequelize");
const my_db = require('../util/connect_db');

const User = my_db.define("users",{
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  fullName:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password:{
    type: Sequelize.STRING,
    allowNull: false
  },
  email:{
    type: Sequelize.STRING,
    allowNull: false
  },
  phoneNumber:{
    type: Sequelize.STRING,
    allowNull: false
  },
  address1:{
    type: Sequelize.TEXT,
    allowNull: true
  },
  address2:{
    type: Sequelize.TEXT,
    allowNull: true
  },
  profilePicture:{
    type: Sequelize.TEXT,
    allowNull: true
  },
  role:{
    type: Sequelize.ENUM("CUSTOMER", "SELLER"),
    allowNull: false
  }
})

module.exports = User;