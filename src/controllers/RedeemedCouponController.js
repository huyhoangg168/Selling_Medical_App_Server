const redeemedCouponService = require('../services/RedeemedCouponService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

//[GET] /api/redeemed-coupons
exports.getAllRedeemedCoupon = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const redeemedCoupons = await redeemedCouponService.getAllRedeemedCoupon(userId);
    res.status(200).json(redeemedCoupons);
});

//[POST] /api/redeemed-coupons
exports.exchangeCoupon = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const coupoon = req.body;
    const redeemedCoupon = await redeemedCouponService.exchangeCoupon(userId, coupoon);
    res.status(201).json(redeemedCoupon);
});