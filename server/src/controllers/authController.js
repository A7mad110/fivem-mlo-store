const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const User = require('../models/User');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email');
const { sendUserRegistered, sendUserLoggedIn } = require('../utils/discord');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
};

const generateCode = () => crypto.randomInt(100000, 999999).toString();

const validate = {
  username: (v) => typeof v === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(v),
  email: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  password: (v) => typeof v === 'string' && v.length >= 8,
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!validate.username(username) || !validate.email(email) || !validate.password(password)) {
      return res.status(400).json({ message: 'Invalid input. Username (3-20 chars, alphanumeric), valid email, password (min 8 chars) required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const code = generateCode();
    const user = new User({
      username,
      email,
      password,
      verificationCode: code,
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
    });
    await user.save();
    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }
    const token = generateToken(user);
    sendUserRegistered(user);
    res.status(201).json({ token, user: user.toJSON(), message: 'Verification code sent to email' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    sendUserLoggedIn(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.json({ message: 'Already verified' });
    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    res.json({ message: 'Email verified successfully', user: user.toJSON() });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.json({ message: 'Already verified' });
    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    try {
      await sendVerificationEmail(user.email, code);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }
    res.json({ message: 'Verification code resent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.json({ message: 'If the email exists and uses password login, a reset code has been sent' });
    }
    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendResetPasswordEmail(email, code);
    res.json({ message: 'Reset code sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Invalid input. Password must be at least 8 characters' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });
    if (user.resetPasswordCode !== code || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const passport = require('../config/passport');

exports.discordAuth = (req, res, next) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.discordState = state;
  passport.authenticate('discord', { state })(req, res, next);
};

exports.discordCallback = (req, res, next) => {
  if (req.session.discordState && req.query.state !== req.session.discordState) {
    return res.redirect(`${config.frontendUrl}/login?error=invalid_state`);
  }
  if (req.session.discordState) delete req.session.discordState;
  passport.authenticate('discord', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${config.frontendUrl}/login?error=discord_auth_failed`);
    }
    const token = generateToken(user);
    sendUserLoggedIn(user, 'discord');
    res.redirect(`${config.frontendUrl}/auth/discord/success?token=${encodeURIComponent(token)}`);
  })(req, res, next);
};
