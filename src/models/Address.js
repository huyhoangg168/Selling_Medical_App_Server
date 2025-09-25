const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        require: true
    },
    user_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        require: true
    },
    phone: {
        type: DataTypes.TEXT,
        allowNull: false,
        require: true,
        validate: {
            isVNPhoneNumber(value) {
                if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(value)) {
                    throw new Error('Invalid phone number format');
                }
            }
        }
    },
    district: {
        type: DataTypes.TEXT,
        allowNull: false,
        require: true
    },
    province: {
        type: DataTypes.TEXT,
        allowNull: false,
        require: true
    },
    ward: {
        type: DataTypes.TEXT,
        allowNull: false,
        require: true
    },
    type: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    specific_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
}, {
    tableName: 'address',
    timestamps: false,
});


Address.beforeFind((options) => {
    if (!options.where) {
        options.where = {};
    }
    options.where.status = 1;
});

module.exports = Address;
