const { Order, OrderDetail, User, RedeemedCoupon, Cart, RedeemedCoupone, Product } = require('../models/index');
const MoMoOrderInfo = require('../models/MoMoOrderInfo');
const createMomoRequest = require('../Payment/MoMo/CreateMomoRequest');
const createZaloPayRequest = require('../Payment/ZaloPay/CreateZalopayRequest');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const { customAlphabet } = require('nanoid');
const { Op, literal } = require('sequelize');
const sequelize = require('../config/database');
const CustomError = require('../Utils/CustomError');
const { el } = require('date-fns/locale');

const notificateService = require('../services/NotificateService');



exports.getAllOrdersByUserId = asyncErrorWrapper(async (userId) => {
    const orders = await Order.findAll({
        where: { id_user: userId },
        include: [{
            model: User,
            as: 'user',
            attributes: ['phone', 'email', 'username']
        },
        {
            model: RedeemedCoupon,
            as: 'redeemed_coupons',
            attributes: ['code',],
        },
        ],
        attributes: { exclude: ['id_user', 'id_redeemed_coupon'] }
    });
    return orders;
});

exports.getAllOrdersForAdmin = asyncErrorWrapper(async (status) => {
    const whereClause = {};

    // Nếu muốn chỉ lấy đơn "chờ duyệt" thì dùng status = 2
    if (status !== undefined) {
        whereClause.status = status;
    }

    const orders = await Order.findAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['phone', 'email', 'username']
            },
            {
                model: RedeemedCoupon,
                as: 'redeemed_coupons',
                attributes: ['code']
            }
        ],
        attributes: { exclude: ['id_user', 'id_redeemed_coupon'] },
        order: [['orderTime', 'DESC']]
    });

    return orders;
});

// Thống kê đơn hàng cho admin
// status: 1 = thành công, 0 = hủy, 2 = đang chờ
exports.getAdminOrderStatistics = asyncErrorWrapper(async () => {
    // Tổng số đơn
    const totalOrders = await Order.count();

    // Số đơn theo trạng thái
    const successCount = await Order.count({ where: { status: 1 } });
    const failedCount  = await Order.count({ where: { status: 0 } });
    const pendingCount = await Order.count({ where: { status: 2 } });

    // Tổng tiền (thường chỉ tính đơn thành công)
    const totalRevenue = (await Order.sum('total', { where: { status: 1 } })) || 0;

    return {
        totalOrders,
        totalRevenue,
        successCount,
        failedCount,
        pendingCount
    };
});


async function getOrderByCode(code) {
    const order = await Order.findOne({
        where: { code: code },
        include: [{
            model: User,
            as: 'user',
            attributes: ['phone', 'email', 'username']
        },
        {
            model: RedeemedCoupon,
            as: 'redeemed_coupons',
            attributes: ['code',],
        },
        ],
        attributes: { exclude: ['id_user', 'id_redeemed_coupon'] }
    });
    return order;
};

exports.getOrderByCode = asyncErrorWrapper(getOrderByCode);

exports.createOrderWithCOD = asyncErrorWrapper(async (listCartItem, order) => {
    return await sequelize.transaction(async (t) => {
        order.code = generateOrderCode();
        order.status = 2; //pending

        const newOrder = await Order.create(order, { transaction: t });

        if (newOrder) {
            await handleOrderCompletion(listCartItem, newOrder, t);
        }

        //order success => send notification
        // await sendUserNotification(
        //     {
        //         id_user: order.userId,
        //         title: 'Đặt hàng thành công!',
        //         content: `Cảm ơn sự ủng hộ của bạn! Đơn hàng với ${listCartItem.length} sản phẩm đang trên đường đến bạn.`
        //     }
        // );
        return newOrder;
    });
});


exports.createOrderWithMoMo = asyncErrorWrapper(async (listCartItem, order) => {

    const orderCode = generateOrderCode();
    const amount = order.total;

    //1. gửi yêu cầu thanh toán đến momo
    const result = await createMomoRequest.sendMoMoReq(orderCode, amount);

    if (result.resultCode !== 0) { // Gửi request thất bại
        const error = new CustomError('Bad Gateway: The server received an invalid response from the upstream server', 502)
        throw error;
    }

    // 2. Tạo đơn hàng mới + trừ kho trong 1 transaction (chống oversell)
    return await sequelize.transaction(async (t) => {
        order.code = orderCode;
        order.status = 2; //pending
        const newOrder = await Order.create(order, { transaction: t });

        if (newOrder) {
            await handleOrderCompletion(listCartItem, newOrder, t);
        }
        console.log(result)
        return result;
    });
});


exports.saveMoMoOrderInfo = asyncErrorWrapper(async (orderInfo) => {
    const momoOrderInfo = await MoMoOrderInfo.create(orderInfo);
    return momoOrderInfo;
});


const handleOrderCompletion = asyncErrorWrapper(async (listCartItem, order, transaction) => {
    // 1.Thêm các mặt hàng vào chi tiết đơn hàng
    const listOrderItem = listCartItem.map(item => ({
        id_order: order.id,
        id_product: item.product.id,
        productPrice: item.product.price,
        discountPrice: item.product.price * item.product.discountPercent,
        quantity: item.quantity
    }));

    await OrderDetail.bulkCreate(listOrderItem, { transaction });

    // 2.Cập nhật số lượng sản phẩm trong kho (atomic + chống oversell)
    const updateResults = await Promise.all(listOrderItem.map(item =>
        Product.update(
            { quantity: literal(`quantity - ${item.quantity}`) },
            {
                where: {
                    id: item.id_product,
                    quantity: { [Op.gte]: item.quantity } // chỉ trừ kho nếu còn đủ
                },
                transaction
            }
        )
    ));

    // Nếu có sản phẩm không đủ tồn (affectedRows = 0) => rollback toàn bộ
    const isOutOfStock = updateResults.some(([affectedRows]) => affectedRows === 0);
    if (isOutOfStock) {
        throw new CustomError('Thanh toán không thành công: sản phẩm đã hết hàng hoặc không đủ số lượng.', 409);
    }

    // 3. Cộng điểm thưởng cho người dùng
    const user = await User.findByPk(order.userId, { transaction });
    user.point += order.point;
    await user.save({ transaction });

    // 4. Xóa mục giỏ hàng
    const productIds = listCartItem.map(item => item.product.id);
    await Cart.destroy({
        where: {
            id_product: { [Op.in]: productIds },
            id_user: user.id
        },
        transaction
    });

    // 5. Cập nhật mã khuyến mãi đã sử dụng (update status)
    if (order.redeemedCouponId !== 0) {
        const redeemedCoupon = await RedeemedCoupon.findByPk(order.redeemedCouponId, { transaction });
        if (!redeemedCoupon) {
            const error = new CustomError('The redeemed has been used!', 400);
            throw error;
        }
        let currentDate = new Date(Date.now());
        if (redeemedCoupon.expiryDate.getTime() < currentDate) {
            const error = new CustomError('The redeemed coupon has expired!', 400);
            throw error;
        }
        redeemedCoupon.status = 0;
        await redeemedCoupon.save({ transaction });
    }
});


const generateOrderCode = () => {
    const alphabetNanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
    const now = Date.now();
    const strings = alphabetNanoid() + now
    let characters = strings.split('');
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return "HD" + characters.join('').toUpperCase();
};

const handleUpdateOrderStatus = asyncErrorWrapper(async (orderCode, status) => {
    const order = await getOrderByCode(orderCode);
    if (order) {
        order.status = status;
        await order.save();
    }
});

exports.handleUpdateOrderStatus = asyncErrorWrapper(handleUpdateOrderStatus);

exports.createOrderWithZaloPay = asyncErrorWrapper(async (listCartItem, order, username) => {
    const orderCode = generateOrderCode();
    const amount = order.total;

    //1. gửi request thanh toán tới Zalopay
    const result = await createZaloPayRequest.sendZaloPayReq(listCartItem, amount, orderCode, username);
    if (result.return_code !== 1) { // Gửi request thất bại
        const error = new CustomError(result.return_message, 502)
        throw error;
    }

    // 2. Tạo đơn hàng mới
    order.code = orderCode;
    order.status = 2; //pending 
    const newOrder = await Order.create(order);

    if (newOrder) {
        await handleOrderCompletion(listCartItem, newOrder);  //Process data related to orders : cart, point, coupon, ...
    }

    return result;
});



exports.monitorZaloPayOrderStatus = asyncErrorWrapper(async (userId, app_trans_id) => {
    const orderId = app_trans_id.split('_')[1];

    const checkInterval = 30000; // Kiểm tra mỗi 30 giây
    const maxDuration = 15 * 60 * 1000; // 15 phút
    let startTime = Date.now();

    const performCheck = async () => {

        try {
            const result = await createZaloPayRequest.checkZaloPayOrderStatus(app_trans_id);

            console.log("Checking zalopay order status: ", result.return_code);

            if (result.return_code === 1) {
                await handleUpdateOrderStatus(orderId, 1);
                
                await sendUserNotification(     //order success => send notification
                    {
                        id_user: userId,
                        title: 'Đặt hàng thành công!', 
                        content: `Cảm ơn sự ủng hộ của bạn! Đơn hàng #${orderId} đã được Medimate chuẩn bị và đang trên đường đến bạn.`
                    }
                );
                return result.return_code;
            } else if (result.return_code === 2) {
                await handleUpdateOrderStatus(orderId, 0);
                return result.return_code;
            } else if (result.return_code === 3 && Date.now() - startTime < maxDuration) {
                setTimeout(performCheck, checkInterval);
            } else {
                await handleUpdateOrderStatus(orderId, 0);
                return result.return_code;
            }
        } catch (error) {
            console.error(`Error checking ZaloPay order status for order ${orderId}:`, error);
            await handleUpdateOrderStatus(orderId, 0);
        }

    };

    return await performCheck();
});


exports.monitorMoMoOrderStatus = asyncErrorWrapper(async (userId, partnerCode, requestId, orderId) => {

    const checkInterval = 30000; // Kiểm tra mỗi 30 giây
    const maxDuration = 15 * 60 * 1000; // 15 phút
    let startTime = Date.now();

    const performCheck = async () => {

        try {
            const result = await createMomoRequest.checkMoMoOrderStatus(partnerCode, requestId, orderId);

            console.log("Checking momo order status: ", result.resultCode);

            if (result.resultCode === 0 || result.resultCode === 9000) {
                //success
                await handleUpdateOrderStatus(orderId, 1);
                await sendUserNotification(  //order success => send notification
                    {
                        id_user: userId,
                        title: 'Đặt hàng thành công!', //title
                        content: `Cảm ơn sự ủng hộ của bạn! Đơn hàng #${orderId} đã được Medimate chuẩn bị và đang trên đường đến bạn.`
                    }
                );
                return result.resultCode;
            } else if ((result.resultCode === 1000 || result.resultCode === 7000) && Date.now() - startTime < maxDuration) {
                //pending
                setTimeout(performCheck, checkInterval);
            } else {
                // failed
                await handleUpdateOrderStatus(orderId, 0);
                return result.resultCode;
            }
        } catch (error) {
            console.error(`Error checking MoMo order status for order ${orderId}:`, error);
            await handleUpdateOrderStatus(orderId, 0);
        }

    };

    return await performCheck();
});


const sendUserNotification = async ({ id_user, title, content }) => {
    const image = 'https://cdni.iconscout.com/illustration/premium/thumb/order-confirmation-5365232-4500195.png'; //example image
    await notificateService.sendUserNotification({ id_user, title, content, image });
};





