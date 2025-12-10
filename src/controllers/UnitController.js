// src/controllers/UnitController.js
const unitService = require('../services/UnitService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');

// [GET] /api/unit
exports.getUnits = asyncErrorHandler(async (req, res, next) => {
    const units = await unitService.getUnits();
    res.status(200).json(units);
});
