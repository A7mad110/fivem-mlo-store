const { Router } = require('express');
const router = Router();
const productCtrl = require('../controllers/productController');

router.get('/', productCtrl.getAllProducts);
router.get('/featured', productCtrl.getFeaturedProducts);
router.get('/categories', productCtrl.getCategories);
router.get('/:slug', productCtrl.getProductBySlug);

module.exports = router;
