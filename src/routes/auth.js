const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');
const keyController = require('../controllers/KeyController');


router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/login-with-google').post(authController.loginWithGoogle);
router.route('/logout').post(authController.protect, authController.logout);
router.route('/refresh-access-token').post(authController.protect, authController.refreshAccessToken);
router.route('/send-otp').post(authController.sendOTP);
router.route('/verify-otp').post(authController.verifyOTP);
router.route('/exchange-key')
      .post(authController.protect, keyController.exchangeKey);




    
module.exports = router;