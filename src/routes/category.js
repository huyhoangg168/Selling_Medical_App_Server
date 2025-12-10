// src/routes/category.js
const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/CategoryController');
// const authController = require('../controllers/AuthController');

// Public:
router.get('/', categoryController.getCategories);

// Hoặc nếu muốn chỉ admin:
// router.get('/', authController.protect, authController.restrict('admin'), categoryController.getCategories);

module.exports = router;
