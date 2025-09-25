const asyncErrorWrapper = require('../../Utils/AsyncErrorWrapper');
const getOrderByCode = require('../../services/OrderService');
const orderService = require('../../services/OrderService');
const crypto = require('crypto');
const CustomError = require('../../Utils/CustomError');
const MoMoOrderInfo = require('../../models/MoMoOrderInfo');

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000; // milliseconds

// Update order status when MoMo server sends a callback
//**************************************************************** */
// After receiving data from momo server, we do the following tasks:
//1. verify Signature
//2. get MoMo Order Info in DB , if null => update order status = failed
//3. verify MoMo Order Info with data from momo server, if any filed not equal => update order status = failed
//4. update update order status with resultCode from data
//****************************************************************** */
exports.handleCallbackMoMoServer = asyncErrorWrapper(async (data) => {

    // Verify Signature
    // const verifySignature = verifyMoMoSignature(data);
    // if (!verifySignature) {
    //     const error = new CustomError('Invalid signature', 400);
    //     throw error;
    // }

    // MoMo order information may not have been saved to DB in time by the client, so we need to try again a few times
    let retries = MAX_RETRIES;
    let order = null;

    while (retries > 0) {
        try {
            order = await MoMoOrderInfo.findByPk(data.orderId);

            if (order) {
                break;
            } else {
                throw new Error("Order is Null");
            }
        } catch (error) {
            retries -= 1;
            if (retries > 0) {
                const delay = INITIAL_DELAY * Math.pow(2, MAX_RETRIES - retries);  //The waiting time next time is double the previous time
                console.log(`MoMo order info  maybe NULL, Retrying get Order in ${delay}ms... Remaining retries: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Max retries reached. Order not found.');
                await orderService.handleUpdateOrderStatus(data.orderId, 0);
                return;
            }
        }
    }

    const orderInfo = order.dataValues;

    if (orderInfo.partnerCode !== data.partnerCode ||
        orderInfo.orderId !== data.orderId ||
        orderInfo.orderInfo !== data.orderInfo ||
        orderInfo.orderType !== data.orderType ||
        orderInfo.requestId !== data.requestId ||
        orderInfo.amount !== data.amount.toString() ||
        orderInfo.transId !== data.transId.toString() ||
        orderInfo.resultCode !== data.resultCode.toString() ||
        orderInfo.message !== data.message ||
        orderInfo.payType !== data.payType
        //orderInfo.signature !== data.signature
    ) {
        const error = new CustomError('Invalid data order info', 400);
        throw error;
    }

    if (data.resultCode == 0 || data.resultCode == 9000) { // Order successfully
        // Update order status
        await orderService.handleUpdateOrderStatus(data.orderId, 1);
    } else {
        await orderService.handleUpdateOrderStatus(data.orderId, 0);
    }
});



const verifyMoMoSignature = (data) => {
    const rawSignature = createRawSignature(data);

    console.log("rawSignature verify : ", rawSignature)
    const signature = crypto.createHmac('sha256', process.env.MOMO_SECRECT_KEY)
        .update(rawSignature)
        .digest('hex');

    console.log("signature verify : ", signature)
    console.log("signature data : ", data.signature)
    return signature === data.signature;
};

const createRawSignature = (data) => {
    // const sortedKeys = Object.keys(data).sort();
    const sortedKeys = Object.keys(data)
        .filter(key => key !== 'signature')
    //.sort();


    // Tạo chuỗi ký tự thô bằng cách nối các tham số đã được sắp xếp
    const rawSignature = sortedKeys
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');

    return rawSignature;
};