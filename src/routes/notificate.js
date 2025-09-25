const express = require('express');
const router = express.Router();

const notificateController = require('../controllers/NotificateController');
const authController = require('../controllers/AuthController');

router.route('/all').post( notificateController.sendGlobalNotification);

router.route('/device-token').post(authController.protect, notificateController.saveFirebaseDeviceToken);

router.route('/')
    .get( authController.protect, notificateController.getNotificationsByUserId)
    .post( notificateController.sendUserNotification)

module.exports = router;