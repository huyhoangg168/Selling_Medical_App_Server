const addressService = require('../services/AddressService');
const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');

exports.getAddressesByUserId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const addresses= await addressService.getAddressesByUserId(userId);
    res.status(200).json(addresses);
});

exports.updateAddress = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const addressUpdate = req.body;
    await addressService.updateAddress(userId, addressUpdate);
    res.status(204).end();
});

//soft delete
exports.deleteAddress = asyncErrorHandler(async (req, res, next) => {
    const addressId = req.params.id;
    await addressService.deleteAddress(addressId);
    res.status(204).end();
});

exports.saveAddress = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    const addressSave = req.body;
    const address = await addressService.saveAddress(userId, addressSave);
    res.status(201).json(address);
});

exports.getProvinces = asyncErrorHandler(async (req, res, next) => {
    const provinces= await addressService.getProvinces();
    res.status(200).json(provinces);
});

exports.getDistricts = asyncErrorHandler(async (req, res, next) => {
    const provinceId = req.params.id;
    const districts= await addressService.getDistricts(provinceId);
    res.status(200).json(districts);
});

exports.getWards = asyncErrorHandler(async (req, res, next) => {
    const districtId = req.params.id;
    const wards= await addressService.getWards(districtId);
    res.status(200).json(wards);
});
