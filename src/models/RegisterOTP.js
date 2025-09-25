const sequelize = require('../config/database');
const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const OTP = sequelize.define('OTP', {
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    otpCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    timestamps: false,
    tableName: 'register_otp',
});


//NOT working, maybe bug in sequelize:((
// OTP.beforeUpsert(async (otp, options) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         otp.otpCode = await bcrypt.hash(otp.otpCode, salt);
//         otp.expiresAt = new Date(Date.now() + 60 * 1000); // expires in 60 seconds
//     } catch (err) {
//         throw err;
//     }
// });



module.exports = OTP;