const cartService = require('../services/CartService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

//[GET] /api/cart
exports.getCarts = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const carts = await cartService.getCarts(userId);
    res.status(200).json(carts);

});

//[GET] /api/distinct-product-count
exports.getDistinctProductCount = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const result = await cartService.getDistinctProductCount(userId);
    res.status(200).json(result);
});

//[POST] /api/cart
exports.saveCart = asyncErrorHandler(async (req, res, next) => {
    const id_user = req.user.id;
    const {  id_product, quantity } = req.body;
    const cart = await cartService.saveCart(id_user, id_product, quantity);
    res.status(201).json(cart);
});

//[PATCH] /api/cart
exports.updateCart = asyncErrorHandler(async (req, res, next) => {
    const id_user = req.user.id;
    const {  id_product, quantity } = req.body;
    await cartService.updateCart(id_user, id_product, quantity);
    res.status(204).end();
});

//[DELETE] /api/cart
exports.deleteCart = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const productId = req.params.id;
    await cartService.deleteCart(userId, productId);
    res.status(204).end();
});

