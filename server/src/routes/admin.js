const { Router } = require('express');
const router = Router();
const adminCtrl = require('../controllers/adminController');
const couponCtrl = require('../controllers/couponController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/dashboard', adminCtrl.getDashboard);
router.get('/products', adminCtrl.getAllProducts);
router.post('/products', adminCtrl.createProduct);
router.put('/products/:id', adminCtrl.updateProduct);
router.delete('/products/:id', adminCtrl.deleteProduct);
router.get('/orders', adminCtrl.getAllOrders);
router.put('/orders/:id/status', adminCtrl.updateOrderStatus);
router.get('/users', adminCtrl.getAllUsers);
router.put('/users/:id/role', adminCtrl.updateUserRole);
router.delete('/users/:id', adminCtrl.deleteUser);
router.get('/coupons', couponCtrl.getAllCoupons);
router.post('/coupons', couponCtrl.createCoupon);
router.put('/coupons/:id', couponCtrl.updateCoupon);
router.delete('/coupons/:id', couponCtrl.deleteCoupon);
router.get('/webhooks', adminCtrl.getWebhookSettings);
router.put('/webhooks', adminCtrl.updateWebhookSettings);
router.post('/webhooks/test', adminCtrl.testWebhook);

module.exports = router;
