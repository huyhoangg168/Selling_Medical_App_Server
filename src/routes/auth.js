const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');


router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/login-with-google').post(authController.loginWithGoogle);
router.route('/logout').post(authController.protect, authController.logout);
router.route('/refresh-access-token').post(authController.protect, authController.refreshAccessToken);
router.route('/send-otp').post(authController.sendOTP);
router.route('/verify-otp').post(authController.verifyOTP);




    
module.exports = router;