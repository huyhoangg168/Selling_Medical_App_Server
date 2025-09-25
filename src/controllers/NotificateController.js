const notificateService = require('../services/NotificateService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

//[GET] /api/notification
exports.getNotificationsByUserId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const notifications = await notificateService.getNotificationsByUserId(userId);
    res.status(200).json(notifications);
});



//[POST] /api/notification
//noti to user
exports.sendUserNotification = asyncErrorHandler(async (req, res, next) => {
    const notificate = req.body;
    const notification = await notificateService.sendUserNotification(notificate);
    res.status(201).json(notification);
});

//[POST] /api/notification/all
//noti to all user
exports.sendGlobalNotification = asyncErrorHandler(async (req, res, next) => {
    const notificate = req.body;
    const notification = await notificateService.sendGlobalNotification( notificate);
    res.status(201).json(notification);
});


exports.saveFirebaseDeviceToken = asyncErrorHandler(async (req, res, next) => {
    const token = req.body.token;
    const userId = req.user.id
    deviceToken = {userId: userId, token: token}
    await notificateService.saveToken(deviceToken)
    res.status(204).end();
});