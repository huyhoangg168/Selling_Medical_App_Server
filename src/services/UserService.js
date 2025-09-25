const { User } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

exports.getUser = asyncErrorWrapper(async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['passwordChangedAt'] }
      });
      
    return user;
});


exports.updateUser = asyncErrorWrapper(async (userId, userUpdate) => {
    const [updated] = await User.update(
        userUpdate,
        { where: { id: userId } }
    );
});


exports.checkPhoneNumberAlreadyExists = asyncErrorWrapper(async (phoneNumber) => {
    const user = await User.findOne({where: {phone : phoneNumber}})
    if(user)
        return true;
    return false
});