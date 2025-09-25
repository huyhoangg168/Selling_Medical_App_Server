const { Notificate, FirebaseDeviceToken } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const { Op } = require('sequelize');
const admin = require('../config/firebase');

exports.getNotificationsByUserId = asyncErrorWrapper(async (userId) => {
    const notifications = await Notificate.findAll({
        where: {
            [Op.or]: [
                { id_user: userId },
                { id_user: null }   //id_user = null is global notification
            ]
        }
    });
    return notifications;
});


//noti to user
exports.sendUserNotification = asyncErrorWrapper(async (notificate) => {
    const deviceToken = await FirebaseDeviceToken.findByPk(notificate.id_user); //get firebase device token
   
    const message = {
        notification: {
            title: notificate.title,
            body: notificate.content
        },
        android: {
          notification: {
            imageUrl: notificate.image,
            priority: 'high',
            //clickAction: 'OPEN_NOTIFICATION_ACTIVITY',
          }
        },
        token: deviceToken.token,
        //collapseKey: 'user_notification',
        //topic: 'global'  //this messeage will be sent to all client subcribe to global topic
    };
    await admin.messaging().send(message);
   
    //save notificaion to db
    const notifications = await Notificate.create(notificate);
    return notifications;
});

//noti to all user
exports.sendGlobalNotification = asyncErrorWrapper(async ( notificate) => {

    const message = {
        notification: {
            title: notificate.title,
            body: notificate.content
        },
        android: {
          notification: {
            //imageUrl: notificate.image,
            imageUrl: notificate.image,
            priority: 'high',
            //clickAction: 'OPEN_NOTIFICATION_ACTIVITY',
          }
        },
        topic: 'global'  //this messeage will be sent to all client subcribe to global topic
    };
    await admin.messaging().send(message);
    const notifications = await Notificate.create(notificate);
    return notifications;
});


exports.saveToken = asyncErrorWrapper(async (deviceToken) => {
    
    const token = await FirebaseDeviceToken.upsert(deviceToken);
    return token;
});