const sequelize = require('../config/database');
const { DataTypes, Op } = require('sequelize');

const Notificate = sequelize.define('Notificate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    title: {
        type: DataTypes.STRING,
        len: 255,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.NOW,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'notification',
    timestamps: false,
});

module.exports = Notificate;