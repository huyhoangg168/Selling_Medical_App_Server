const express = require('express');
const router = express.Router();

const orderDetailController = require('../controllers/OrderDetailController');
const authController = require('../controllers/AuthController');


router.route('/:id')
    .get(authController.protect, orderDetailController.getAllOrderItemByOrderId)

module.exports = router;