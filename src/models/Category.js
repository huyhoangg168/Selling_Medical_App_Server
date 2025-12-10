// src/models/Category.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Category = sequelize.define('Category', {
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
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'category',
    timestamps: false,
});

module.exports = Category;
