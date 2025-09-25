const crypto = require('crypto');
const axios = require('axios');
const asyncErrorWrapper = require('../../Utils/AsyncErrorWrapper');

const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRECT_KEY;
const orderInfo = 'Thanh toán cho đơn hàng tại Medimate';
const partnerCode = 'MOMO';
const redirectUrl = 'medimate://online-payment-completed/momo';
const ipnUrl = `${process.env.HOST}/api/order/momo/callback` ; //ping to this URL if payment success
const requestType = "captureWallet";
const extraData = '';
const orderGroupId = '';
const autoCapture = true;
const lang = 'vi';
const orderExpireTime = 15; // minutes

exports.sendMoMoReq = asyncErrorWrapper(async (orderId, amount) => {

    var requestId = orderId;

    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

 

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "TestMoMo",
        storeId: "Medimate",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderExpireTime: orderExpireTime,
        orderGroupId: orderGroupId,
        signature: signature
    });


    //MOMO option for axios
    const options = {
        method: 'POST',
        url: process.env.MOMO_REQ_URL,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }

    const result = await axios(options);
    

    return result.data;
});



exports.checkMoMoOrderStatus = asyncErrorWrapper(async (partnerCode, requestId, orderId) => {
   
    const rawSignature = "accessKey=" + process.env.MOMO_ACCESS_KEY + "&orderId=" + orderId  + "&partnerCode=" + partnerCode + "&requestId=" + requestId 
    const signature = crypto.createHmac('sha256', process.env.MOMO_SECRECT_KEY).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: 'vi'
    });

    const options = {
        method: 'POST',
        url: process.env.MOMO_REQ_CHECK_STATUS_URL,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }

    const result = await axios(options);
    return result.data;

});
