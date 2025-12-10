// src/routes/unit.js
const express = require('express');
const router = express.Router();

const unitController = require('../controllers/UnitController');
// Nếu muốn bắt buộc đăng nhập thì thêm:
// const authController = require('../controllers/AuthController');

// Nếu muốn mở public:
router.get('/', unitController.getUnits);

// Nếu muốn chỉ admin mới xem được:
// router.get('/', authController.protect, authController.restrict('admin'), unitController.getUnits);

module.exports = router;
