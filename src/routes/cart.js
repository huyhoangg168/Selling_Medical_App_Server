const express = require('express');
const router = express.Router();

const cartController = require('../controllers/CartController');
const authController = require('../controllers/AuthController');

router.route('/distinct-product-count').get(authController.protect, cartController.getDistinctProductCount);

router.route('/')
    .get(authController.protect, cartController.getCarts)
    .post(authController.protect, cartController.saveCart)
    .patch(authController.protect, cartController.updateCart)


router.route('/:id')
    .delete(authController.protect, authController.restrict('admin','user'), cartController.deleteCart)

    
module.exports = router;