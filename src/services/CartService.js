const { Cart, Product, Unit } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const CustomError = require('../Utils/CustomError');

exports.getCarts = asyncErrorWrapper(async (userId) => {
    const carts = await Cart.findAll({
        where: { id_user: userId },
        include: [{
            model: Product,
            as: 'product',
            include: [{
                model: Unit,
                as: 'unit',
                attributes: ['name'],
            }],
            attributes: ['id','name','price','image','discountPercent','status']
        }],
        attributes: { exclude: ['id_user', 'id_product',''] } 
    });
    return carts;
});

exports.getDistinctProductCount = asyncErrorWrapper(async (userId) => {
    const result = await Cart.findAll({
        where: { id_user: userId },
        attributes: ['id_product'],
        group: ['id_product'],
        raw: true,
    });
    return result.length;
});

exports.saveCart = asyncErrorWrapper(async (id_user, id_product, quantity) => {
    const [cart, created] = await Cart.findOrCreate({
        where: { id_user, id_product },
        defaults: { quantity } // create with new quantity 
    });

    if (!created) {
        //cart.quantity = quantity;
        cart.quantity = cart.quantity + quantity;
        await cart.save();
    }

    return cart;
});

exports.updateCart = asyncErrorWrapper(async (id_user, id_product, quantity) => {

    const product = await Product.findByPk(id_product);

    const cart = await Cart.findOne({
        where: { id_user, id_product },
    });

    if(product.quantity < quantity){
        const error = new CustomError("Requested quantity exceeds available stock",400);
        throw error;
    }

    cart.quantity = quantity;
    await cart.save();
});

exports.deleteCart = asyncErrorWrapper(async (userId, productId) => {
    await Cart.destroy({
        where: { id_user: userId, id_product: productId },
    });
});


