const { Router } = require('express');
const router = Router();
const orderCtrl = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.post('/', orderCtrl.createOrder);
router.post('/confirm', orderCtrl.confirmOrder);
router.get('/', orderCtrl.getUserOrders);
router.get('/:id', orderCtrl.getOrderById);

module.exports = router;
