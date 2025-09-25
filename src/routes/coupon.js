const express = require('express');
const router = express.Router();

const couponController = require('../controllers/CouponController');
const authController = require('../controllers/AuthController');


router.route('/')
    .get(authController.protect, couponController.getCoupons)

module.exports = router;