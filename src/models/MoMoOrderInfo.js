const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MoMoOrderInfo = sequelize.define('MoMoOrderInfo', {
    partnerCode : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    orderId  : {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    requestId  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    orderInfo  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    orderType  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transId  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    resultCode  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payType  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    responseTime  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    extraData  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    signature  : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
}, {
    tableName: 'momo_order_info',
    timestamps: false,
});



module.exports = MoMoOrderInfo;