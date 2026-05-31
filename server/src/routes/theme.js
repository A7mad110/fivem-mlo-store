const { Router } = require('express');
const router = Router();
const themeCtrl = require('../controllers/themeController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', themeCtrl.getTheme);
router.put('/', auth, adminOnly, themeCtrl.updateTheme);
router.post('/reset', auth, adminOnly, themeCtrl.resetTheme);

module.exports = router;
