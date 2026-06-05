const { Router } = require('express');
const router = Router();
const couponCtrl = require('../controllers/couponController');
const { auth } = require('../middleware/auth');

router.post('/validate', couponCtrl.validateCoupon);

module.exports = router;
