const { RedeemedCoupon, User, Coupon } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const { addDays } = require('date-fns');
const { customAlphabet } = require('nanoid');

const notificateService = require('../services/NotificateService');


const generateCode = () => {
    const alphabetNanoid  = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
    const numbertNanoid  = customAlphabet('0123456789', 4);
    const strings  = alphabetNanoid() + numbertNanoid()
    let characters = strings.split('');
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return "RC" + characters.join('').toUpperCase();
}

exports.getAllRedeemedCoupon = asyncErrorWrapper(async (userId) => {
    const redeemedCoupons = await RedeemedCoupon.findAll({
        where: {id_user: userId},
        include: [{
            model: Coupon,
            as: 'coupon',
        }],
    });
    return redeemedCoupons;
});

exports.exchangeCoupon = asyncErrorWrapper(async (userId, coupon) => {
   
    const code = generateCode();
    
    const redeemedCoupon = await RedeemedCoupon.create({
        id_coupon: coupon.id, 
        id_user: userId,
        code: code,
        expiryDate: addDays(new Date(), coupon.usageDays),
    });
    //update point after redeemed
    if(redeemedCoupon){
        const usedPoints = coupon.point;
        const user = await User.findByPk(userId);
        if(user){
            user.point = user.point - usedPoints
            await user.save();
        }
    }

    //send notification
    let notificate = {};
    notificate.id_user = userId;
    notificate.title = "Quy đổi mã giảm giá thành công!";
    notificate.content = `Chúc mừng! Bạn đã nhận được mã coupon giảm giá #${code}. Mua sắm ngay để tận dụng ưu đãi. \nƯu đãi có thời hạn, hãy sử dụng ngay!`;
    notificate.image = coupon.image;
    notificateService.sendUserNotification(notificate);

    return redeemedCoupon;
});
