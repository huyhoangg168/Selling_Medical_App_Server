const express = require('express');
const router = express.Router();

const redeemedCouponController = require('../controllers/RedeemedCouponController');
const authController = require('../controllers/AuthController');


router.route('/')
    .get(authController.protect, redeemedCouponController.getAllRedeemedCoupon)
    .post(authController.protect, redeemedCouponController.exchangeCoupon)

module.exports = router;