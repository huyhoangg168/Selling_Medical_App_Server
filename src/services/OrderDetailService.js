const { OrderDetail, Product, Unit } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

exports.getAllOrdersItemByOrderId = asyncErrorWrapper(async (orderId) => {
    console.log(orderId)
    const orderItems = await OrderDetail.findAll({
        where: { id_order: orderId },
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'image'],
                include: [{
                    model: Unit,
                    as: 'unit',
                    attributes: ['name'],
                }]
            },
            
        ],
        attributes: { exclude: ['id_product', 'id_order'] }
    });
    return orderItems;
});