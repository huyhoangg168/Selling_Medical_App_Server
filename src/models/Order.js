const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    require: true,
    field: 'id_user'
  },
  redeemedCouponId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_redeemed_coupon'
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'payment_method' 
  },
  totalCouponDiscount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_coupon_discount',
    defaultValue: 0,
  },
  totalProductDiscount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_product_discount',
    defaultValue: 0,
  },
  totalDiscount: {
    type: DataTypes.VIRTUAL,
    get() {
        return this.getDataValue('totalCouponDiscount') + this.getDataValue('totalProductDiscount');
      }
  },
  orderTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'order_time',
    defaultValue: DataTypes.NOW
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    require: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  userAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'user_address'
  }
}, {
  tableName: 'orders',
  timestamps: false,
});

module.exports = Order;
