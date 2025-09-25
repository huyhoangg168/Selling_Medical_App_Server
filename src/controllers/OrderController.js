const orderService = require('../services/OrderService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const receivedMoMoRequest = require('../Payment/MoMo/ReceivedMoMoRequest');
const receivedZaloPayRequest = require('../Payment/ZaloPay/ReceivedZaloPayRequest');
const createZaloPayRequest = require('../Payment/ZaloPay/CreateZalopayRequest');


exports.getAllOrdersByUserId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const orders = await orderService.getAllOrdersByUserId(userId);
    res.status(200).json(orders);
});

exports.getOrderByCode = asyncErrorHandler(async (req, res, next) => {
    const code = req.params.code;
    const order = await orderService.getOrderByCode(code);
    res.status(200).json(order);
});

exports.createOrderWithCOD = asyncErrorHandler(async (req, res, next) => {
    const { id: userId } = req.user;
    const { listCartItem, order } = req.body;

    order.userId = userId;

    const newOrder = await orderService.createOrderWithCOD(listCartItem, order);
    return res.status(201).json(newOrder);

});

exports.createOrderWithMoMo = asyncErrorHandler(async (req, res, next) => {
    const { id: userId } = req.user;
    const { listCartItem, order } = req.body;

    order.userId = userId;

    const result = await orderService.createOrderWithMoMo(listCartItem, order);

    return res.status(201).json(result);

});
exports.saveMoMoOrderInfo = asyncErrorHandler(async (req, res, next) => {
    const momoOrderInfo = req.body;
    const result = await orderService.saveMoMoOrderInfo(momoOrderInfo)
    return res.status(201).json(result);
});



exports.handleCallbackMoMoServer = asyncErrorHandler(async (req, res, next) => {
    //lấy data từ request của momo
    const data = req.body;
    
    await receivedMoMoRequest.handleCallbackMoMoServer(data);
    
    // thông báo kết quả cho MoMo server
    return res.status(204).end();

});



exports.createOrderWithZaloPay = asyncErrorHandler(async (req, res, next) => {

    let { id: userId, username: userName } = req.user;
    const { listCartItem, order } = req.body;

    if(!userName)
        userName = 'user#' + userId;

    order.userId = userId;

    const result = await orderService.createOrderWithZaloPay(listCartItem, order, userName);

    res.status(201).json(result);

    //monitorPaymentStatus('order12');
    
});

exports.handleCallbackZaloPayServer = asyncErrorHandler(async (req, res, next) => {
    //lấy data từ request của zalopay
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    // cập nhật trạng thái đơn hàng dựa vào data từ request zalopay server
    const result = await receivedZaloPayRequest.handleCallbackZaloPayServer(dataStr, reqMac);
    console.log(result);
    // thông báo kết quả cho ZaloPay server
    return res.json(result);

});






exports.checkZaloPayOrderStatus = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const app_trans_id = req.params.app_trans_id;
    const result = await orderService.monitorZaloPayOrderStatus(userId, app_trans_id);
    return res.status(200).json({orderStatus: result});
});


exports.checkMoMoPayOrderStatus = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const {partnerCode, requestId, orderId} = req.query;
    const result = await orderService.monitorMoMoOrderStatus(userId, partnerCode, requestId, orderId);
    return res.status(200).json({orderStatus: result});
});

