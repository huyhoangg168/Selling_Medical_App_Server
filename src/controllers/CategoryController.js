// src/controllers/CategoryController.js
const categoryService = require('../services/CategoryService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');

// [GET] /api/category
exports.getCategories = asyncErrorHandler(async (req, res, next) => {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories);
});
