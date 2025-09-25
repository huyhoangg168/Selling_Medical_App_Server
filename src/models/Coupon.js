const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'discount_percent'
  },
  usageDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usage_days',
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'coupon',
  timestamps: false
});


Coupon.beforeFind((options) => {
    if (!options.where) {
        options.where = {};
    }
    options.where.status = 1;
});

module.exports = Coupon;
