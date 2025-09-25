const orderDetailService = require('../services/OrderDetailService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

exports.getAllOrderItemByOrderId = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.id;
    const orderItems= await orderDetailService.getAllOrdersItemByOrderId(orderId);
    res.status(200).json(orderItems);
});