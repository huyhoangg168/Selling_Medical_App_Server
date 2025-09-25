const sequelize = require('../config/database');
const { DataTypes, Op } = require('sequelize');

const Cart = sequelize.define('Cart', {
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, 
    },

  }, {
    tableName: 'cart_detail', 
    timestamps: false, 
    underscored: true,
  });
  
  module.exports = Cart;