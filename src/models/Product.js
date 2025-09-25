const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');


const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_category: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'unit',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(2000),
    allowNull: false,
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'discount_percent',
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'product',
  timestamps: false, // Nếu bảng của bạn không có cột createdAt và updatedAt
});


Product.beforeFind((options) => {
  if (!options.where) {
      options.where = {};
  }
  options.where.status = 1;
});


module.exports = Product;