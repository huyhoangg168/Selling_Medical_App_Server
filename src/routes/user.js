const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');
const authController = require('../controllers/AuthController');

router.route('/')
    .get(authController.protect, userController.getUser)
    .patch(authController.protect, userController.updateUser)


router.route('/check-phone-number')
    .post( userController.checkPhoneNumberAlreadyExists)

module.exports = router;    