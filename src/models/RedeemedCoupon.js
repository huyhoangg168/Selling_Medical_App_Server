const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RedeemedCoupon = sequelize.define('RedeemedCoupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_coupon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coupon', 
      key: 'id'
    }
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', 
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expiry_date'
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'redeemed_coupons',
  timestamps: false
});


RedeemedCoupon.beforeFind((options) => {
  if (!options.where) {
      options.where = {};
  }
  options.where.status = 1;
});


module.exports = RedeemedCoupon;
