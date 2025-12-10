// src/services/CategoryService.js
const { Category } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

// [GET] /api/category
exports.getCategories = asyncErrorWrapper(async () => {
    const categories = await Category.findAll({
        where: { status: 1 }, // chỉ lấy category đang active
    });
    return categories;
});
