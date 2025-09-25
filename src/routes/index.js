const productRouter = require('./product');
const cartRouter = require('./cart');
const authRouter = require('./auth');
const userRouter = require('./user');
const addressRouter = require('./address');
const orderRouter = require('./order');
const orderDetailRouter = require('./orderDetail');
const couponRouter = require('./coupon');
const redeemedCouponRouter = require('./redeemedCoupon');
const notificateRouter = require('./notificate');
const CustomError = require('../Utils/CustomError');


function route(app) {
    app.use('/api/product', productRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/user', userRouter);
    app.use('/api/address', addressRouter);
    app.use('/api/order', orderRouter);
    app.use('/api/order-detail', orderDetailRouter);
    app.use('/api/coupon', couponRouter);
    app.use('/api/redeemed-coupons', redeemedCouponRouter);
    app.use('/api/notification', notificateRouter);


    app.all('*', (req, res, next) => {
        const err = new CustomError(`Can't find ${req.originalUrl} on the server !`, 404);
        next(err);
    });  
}

module.exports = route;