const CryptoJS = require('crypto-js');
const orderService = require('../../services/OrderService');

exports.handleCallbackZaloPayServer = async (dataStr, reqMac) => {
    let result = {};

    try {

        let mac = CryptoJS.HmacSHA256(dataStr, process.env.KEY_2).toString();

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
            //callback không hợp lệ
            result.return_code = -1;
            result.return_message = "mac not equal";
        }
        else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            let dataJson = JSON.parse(dataStr, process.env.KEY_2);
            let orderCode = dataJson["app_trans_id"].split('_')[1]
            await orderService.handleUpdateOrderStatus(orderCode, 1);

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }
    console.log(result)
    return result;
};