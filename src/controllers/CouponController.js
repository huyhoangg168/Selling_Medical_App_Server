const couponService = require('../services/CouponService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

//[GET] /api/coupon
exports.getCoupons = asyncErrorHandler(async (req, res, next) => {
    const coupons = await couponService.getCoupons();
    res.status(200).json(coupons);
});