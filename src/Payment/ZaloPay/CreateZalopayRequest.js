const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const asyncErrorWrapper = require('../../Utils/AsyncErrorWrapper');


// APP INFO
const config = {
    app_id: process.env.APP_ID,
    key1: process.env.KEY_1,
    key2: process.env.KEY_2,
    endpoint: process.env.CREATE_END_POINT,
};

const embed_data = {
    redirecturl: 'medimate://online-payment-completed/zalopay',
    redirect_url: 'medimate://online-payment-completed/zalopay'
};

exports.sendZaloPayReq = asyncErrorWrapper(async (listCartItem, amount, orderCode, username) => {

    const items = listCartItem;
    const transID = orderCode;
    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: username,
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: `Medimate - Thanh toán cho đơn hàng #${transID}`,
        bank_code: "zalopayapp",
        callback_url: `${process.env.HOST}/api/order/zalopay/callback`
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();


    const result = await axios.post(config.endpoint, null, { params: order });
    return result.data;
});


exports.checkZaloPayOrderStatus = asyncErrorWrapper(async (app_trans_id) => {
   
    let postData = {
        app_id: process.env.APP_ID,
        app_trans_id: app_trans_id, 
    }

    let data = postData.app_id + "|" + postData.app_trans_id + "|" + process.env.KEY_1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, process.env.KEY_1).toString();


    let postConfig = {
        method: 'post',
        url: process.env.QUERY_END_POINT,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(postData)
    };

    const status = await axios(postConfig);
    return status.data;

});
