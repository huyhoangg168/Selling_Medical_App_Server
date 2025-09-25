const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const OrderDetail = sequelize.define('OrderDetail', {
  id_order: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  id_product: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  productPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_price'
  },
  discountPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'discount_price'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'order_detail',
  timestamps: false,
});

module.exports = OrderDetail;
