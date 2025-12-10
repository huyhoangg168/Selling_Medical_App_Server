// src/services/UnitService.js
const { Unit } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

// [GET] /api/unit
exports.getUnits = asyncErrorWrapper(async () => {
    const units = await Unit.findAll({
        where: { status: 1 }, // chỉ lấy đơn vị đang active
    });
    return units;
});
