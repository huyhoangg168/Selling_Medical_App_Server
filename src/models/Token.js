const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');


const Token = sequelize.define('Token', {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    refresh_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'token',
    timestamps: false,
});



module.exports = Token;