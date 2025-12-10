const express = require('express');
const router = express.Router();

const productController = require('../controllers/ProductController');
const authController = require('../controllers/AuthController'); // <– thêm dòng này

router.get('/', productController.getAllProduct);
router.get('/newest', productController.getNewestProduct);
router.get('/top-discounted', productController.getTopDiscountedProducts);
router.get('/discounted', productController.getAllDiscountedProducts);
router.get('/best-selling', productController.getTopBestSellingProducts);
router.get('/filter', productController.getProductByFilter);
router.get('/:id', productController.getProductById);

// ADMIN: thêm / sửa / xóa
router.post(
    '/',
    authController.protect,
    authController.restrict('admin'),
    productController.createProduct
);

router.patch(
    '/:id',
    authController.protect,
    authController.restrict('admin'),
    productController.updateProduct
);

router.delete(
    '/:id',
    authController.protect,
    authController.restrict('admin'),
    productController.deleteProduct
);

module.exports = router;