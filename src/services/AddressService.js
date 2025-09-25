const { Address, User, Province, District, Ward } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

exports.getAddressesByUserId = asyncErrorWrapper(async (userId) => {
    const addresses = await Address.findAll({
        where: { id_user: userId },
    });
    return addresses;
});

exports.updateAddress = asyncErrorWrapper(async (userId, addressUpdate) => {
    const existingDefaultAddress = await Address.findOne({ where: { id_user: userId, is_default: true } });
    if(!existingDefaultAddress)
        addressUpdate.is_default = true;
    if (existingDefaultAddress && addressUpdate.is_default) {
        await existingDefaultAddress.update({ is_default: false })
    }
    await Address.update(addressUpdate, { where: { id: addressUpdate.id } });
});


//soft delete
exports.deleteAddress = asyncErrorWrapper(async (addressId) => {
    await Address.update(
        { status: 0 },
        { where: { id: addressId } }
    );
});


exports.saveAddress = asyncErrorWrapper(async (userId, addressSave) => {
    const existingDefaultAddress = await Address.findOne({ where: { id_user: userId, is_default: true } });
    if(!existingDefaultAddress)
        addressSave.is_default = true;
    if (existingDefaultAddress && addressSave.is_default) {
        await existingDefaultAddress.update({ is_default: false })
    }
    const addr = await Address.create(addressSave);
    return addr;
});

exports.getProvinces = asyncErrorWrapper(async () => {
    const provices = await Province.findAll();
    return provices;
});

exports.getDistricts = asyncErrorWrapper(async (provinceId) => {
    const provices = await District.findAll({ where: { id_province: provinceId } });
    return provices;
});

exports.getWards = asyncErrorWrapper(async (districtId) => {
    const provices = await Ward.findAll({ where: { id_district: districtId } });
    return provices;
});