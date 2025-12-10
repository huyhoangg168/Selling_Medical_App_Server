const express = require('express');
const router = express.Router();

const orderController = require('../controllers/OrderController');
const authController = require('../controllers/AuthController');

// Thống kê đơn hàng cho admin
router.route('/admin/statistics')
    .get(
        authController.protect,
        authController.restrict('admin'),
        orderController.getAdminOrderStatistics
    );

// Route admin -> ĐẶT TRƯỚC '/:code'
router.route('/admin')
    .get(
        authController.protect,
        authController.restrict('admin'),
        orderController.getAllOrdersForAdmin
    );

router.route('/')
    .get(authController.protect, orderController.getAllOrdersByUserId)


router.route('/:code')
    .get(authController.protect, orderController.getOrderByCode)

//*************route of payment with CODE*************
router.route('/cod')
    .post(authController.protect, orderController.createOrderWithCOD)


//*************route of payment with momo*************
router.route('/momo')
    .post(authController.protect, orderController.createOrderWithMoMo)

router.route('/momo/info')
    .post(authController.protect, orderController.saveMoMoOrderInfo)

router.route('/momo/callback')
    .post(orderController.handleCallbackMoMoServer)

router.route('/momo/check-order-status')
    .get(authController.protect, orderController.checkMoMoPayOrderStatus)


//*************route of payment with zalopay***************
router.route('/zalopay')
    .post(authController.protect, orderController.createOrderWithZaloPay)

router.route('/zalopay/callback')
    .post(orderController.handleCallbackZaloPayServer)

router.route('/zalopay/:app_trans_id')
    .get(authController.protect, orderController.checkZaloPayOrderStatus)

// Admin cập nhật trạng thái đơn hàng
router.route('/:code/status')
    .patch(
        authController.protect,         // bắt buộc đăng nhập
        authController.restrict('admin'), // chỉ admin mới được đổi trạng thái
        orderController.updateOrderStatus
    );

module.exports = router;