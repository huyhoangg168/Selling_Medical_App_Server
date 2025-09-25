const sequelize = require('../config/database');
const { DataTypes, Op } = require('sequelize');


const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'unit',
    timestamps: false, // Nếu bảng của bạn không có cột createdAt và updatedAt
  });



  module.exports = Unit;