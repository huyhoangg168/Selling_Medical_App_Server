const ProductService = require('../services/ProductService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');


//[GET] /api/product
exports.getAllProduct = asyncErrorHandler(async (req, res, next) => {
    const products = await ProductService.getAllProduct();
    res.status(200).json(products);
});

//[GET] /api/product/newest
// get 20 newest products
exports.getNewestProduct = asyncErrorHandler(async (req, res, next) => {
    const products = await ProductService.getNewestProduct();
    res.status(200).json(products);
});

//[GET] /api/product/top-discounted
// get 20 top discounted products
exports.getTopDiscountedProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await ProductService.getTopDiscountedProducts();
    res.status(200).json(products);
});

//[GET] /api/product/discounted
// get all discounted products
exports.getAllDiscountedProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await ProductService.getTopDiscountedProducts();
    res.status(200).json(products);
});


//[GET] /api/product/best-selling
// get top 20 best-selling products
exports.getTopBestSellingProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await ProductService.getTopBestSellingProducts();
    res.status(200).json(products);
});


//[GET] /api/product/:id
exports.getProductById = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);
    if (!product) {
        const err = new CustomError(`Can not find product with ID: ${productId}`, 404);
        return next(err);
    }
    res.status(200).json(product);
});


//[GET] /api/product/filter
exports.getProductByFilter = asyncErrorHandler(async (req, res, next) => {
    const keySearch = req.query.keySearch;
    const categoryId = req.query.categoryId;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    //console.log({ keySearch, categoryId, minPrice, maxPrice });

    const products = await ProductService.getProductByFilter(keySearch, categoryId, minPrice, maxPrice);
    res.status(200).json(products);
});

// [POST] /api/product  (ADMIN)
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    const productData = req.body;
    const newProduct = await ProductService.createProduct(productData);
    res.status(201).json(newProduct);
});

// [PATCH] /api/product/:id  (ADMIN)
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;
    const productData = req.body;

    await ProductService.updateProduct(productId, productData);
    res.status(204).end();
});

// [DELETE] /api/product/:id  (ADMIN)
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;

    await ProductService.deleteProduct(productId);
    res.status(204).end();
});

