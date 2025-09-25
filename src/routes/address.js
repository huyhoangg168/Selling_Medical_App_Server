const express = require('express');
const router = express.Router();

const addressController = require('../controllers/AddressController');
const authController = require('../controllers/AuthController');


router.route('/')
    .get(authController.protect, addressController.getAddressesByUserId)
    .post(authController.protect, addressController.saveAddress)
    .patch(authController.protect, addressController.updateAddress)


router.route('/:id')
    .delete(authController.protect, addressController.deleteAddress)

router.route('/province').get(addressController.getProvinces);
router.route('/district/:id').get(addressController.getDistricts);
router.route('/ward/:id').get(addressController.getWards);

    
module.exports = router;