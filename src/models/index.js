const sequelize = require('../config/database');
const Product = require('./Product');
const Unit = require('./Unit');
const User = require('./User');
const Cart = require('./Cart');
const Token = require('./Token');
const Address = require('./Address');
const Province = require('./Province');
const District = require('./District');
const Ward = require('./Ward');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Coupon = require('./Coupon');
const RedeemedCoupon = require('./RedeemedCoupon');
const Notificate = require('./Notificate');
const OTP = require('./RegisterOTP');
const FirebaseDeviceToken = require('./FirebaseDeviceToken');
const Category = require('./Category');

// Product Associations
Product.belongsTo(Unit, {
    foreignKey: 'id_unit',
    as: 'unit',
});

Product.hasOne(Cart, {
    foreignKey: 'id_product',
});

Product.belongsTo(Category, {
    foreignKey: 'id_category',
    as: 'category',
});

Category.hasMany(Product, {
    foreignKey: 'id_category',
    as: 'products',
});

// Unit Associations
Unit.hasOne(Product, {
    foreignKey: 'id',
    as: 'product',
});

// User Associations
User.hasMany(Cart, {
    foreignKey: 'id_user',
    onDelete: 'CASCADE', // Xoá các cart item liên quan nếu user bị xoá
});

User.hasMany(Address, {
    foreignKey: 'id_user',
    as: 'addresses',
    onDelete: 'CASCADE'
});

User.hasMany(Order, {
    foreignKey: 'id_user',
    sourceKey: 'id'
});

User.hasMany(RedeemedCoupon, { 
    foreignKey: 'id_user' 
});

// Cart Associations
Cart.belongsTo(User, {
    foreignKey: 'id_user',
    onDelete: 'CASCADE', // Xoá các cart item liên quan nếu user bị xoá
});

Cart.belongsTo(Product, {
    foreignKey: 'id_product',
    as: 'product',
});

// Token Associations
Token.belongsTo(User, {
    foreignKey: 'id_user',
    onDelete: 'CASCADE' // Nếu user bị xóa, token liên quan cũng sẽ bị xóa
});

// Address Associations
Address.belongsTo(User, {
    foreignKey: 'id_user',
    as: 'user',
    onDelete: 'CASCADE'
});

// Order Associations
Order.hasMany(OrderDetail, {
    foreignKey: 'id_order',
    sourceKey: 'id'
});

Order.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id',
    as: 'user',
});

Order.belongsTo(RedeemedCoupon, {
    foreignKey: 'id_redeemed_coupon',
    targetKey: 'id',
    as: 'redeemed_coupons'
})

// OrderDetail Associations
OrderDetail.belongsTo(Order, {
    foreignKey: 'id_order',
    targetKey: 'id'
});

OrderDetail.belongsTo(Product, {
    foreignKey: 'id_product',
    as: 'product'
});


// Coupon Associations
Coupon.hasMany(RedeemedCoupon, { 
    foreignKey: 'id_coupon' 
});


// RedeemedCoupon Associations
RedeemedCoupon.belongsTo(Coupon, { foreignKey: 'id_coupon', as: 'coupon' });
RedeemedCoupon.belongsTo(User, { foreignKey: 'id_user' });

// Notificate Associations
Notificate.belongsTo(User, { foreignKey: 'id_user' });

module.exports = {
    Product,
    Unit,
    User,
    Cart,
    Token,
    Address,
    Province,
    Ward,
    District,
    Order,
    OrderDetail,
    Coupon,
    RedeemedCoupon,
    Notificate,
    OTP,
    FirebaseDeviceToken,
    Category,
};