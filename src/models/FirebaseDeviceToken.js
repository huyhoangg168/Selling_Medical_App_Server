const sequelize = require('../config/database');
const { DataTypes, Op } = require('sequelize');

const FirebaseDeviceToken = sequelize.define('FirebaseDeviceToken', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        allowNull: false,
        field:'id_user'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    // Các tùy chọn khác cho model
    tableName: 'device', 
    timestamps: false, 
});

module.exports = FirebaseDeviceToken;