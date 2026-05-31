const { Router } = require('express');
const router = Router();
const authCtrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', auth, authCtrl.getMe);
router.post('/verify', auth, authCtrl.verifyEmail);
router.post('/resend-verification', auth, authCtrl.resendVerification);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.get('/discord', authCtrl.discordAuth);
router.get('/discord/callback', authCtrl.discordCallback);

module.exports = router;
