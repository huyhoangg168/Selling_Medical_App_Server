const { Coupon } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');




exports.getCoupons = asyncErrorWrapper(async () => {
    const coupons = await Coupon.findAll();
    return coupons;
});
