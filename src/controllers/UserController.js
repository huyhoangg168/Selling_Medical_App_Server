const UserService = require('../services/UserService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');


exports.getUser = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await UserService.getUser(userId);
    res.status(200).json(user);
});


exports.updateUser = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const userUpdate = req.body;
    await UserService.updateUser(userId, userUpdate);
    res.status(204).end();
});

exports.checkPhoneNumberAlreadyExists = asyncErrorHandler(async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    const isAlreadyExists = await UserService.checkPhoneNumberAlreadyExists(phoneNumber);
    res.status(200).json(isAlreadyExists);
});