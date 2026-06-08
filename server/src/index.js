const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const themeRoutes = require('./routes/theme');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const { auth, adminOnly } = require('./middleware/auth');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const seedProducts = require('./data/products');
const { configureEmail } = require('./utils/email');
const { loadWebhooks } = require('./utils/discord');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://ui-avatars.com", "https://cdn.discordapp.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      upgradeInsecureRequests: [],
    },
  },
}));

const corsOrigins = [config.frontendUrl, process.env.RENDER_EXTERNAL_URL].filter(Boolean);
app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api/', apiLimiter);

app.set('trust proxy', 1);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many login attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again later' },
});
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/debug', (req, res) => {
  res.json({
    jwtSecretExists: !!config.jwtSecret,
    jwtSecretLength: config.jwtSecret ? config.jwtSecret.length : 0,
    frontendUrl: config.frontendUrl,
  });
});

app.post('/api/seed', auth, adminOnly, async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(seedProducts);
    res.json({ message: `Seeded ${created.length} products successfully`, count: created.length });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Seed failed' });
  }
});

const isEmailConfigured = async () => {
  if (config.email.host && config.email.user && config.email.pass) return true;
  try {
    const setting = await require('./models/Setting').findOne({ key: 'email' });
    return !!(setting && setting.value && setting.value.host && setting.value.user);
  } catch (_) { return false; }
};

app.post('/api/setup/verify-email', auth, async (req, res) => {
  if (await isEmailConfigured()) {
    return res.status(403).json({ message: 'Email is configured, use the normal verification code' });
  }
  try {
    const user = await User.findById(req.user._id);
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    res.json({ message: 'Email verified', user: user.toJSON() });
  } catch (err) {
    console.error('Setup verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/setup/first-admin', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ message: 'You are already admin! Log out and log back in to see the Admin link.' });
    }
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Another admin already exists. Ask them to promote you, or delete that admin account first.' });
    }
    req.user.role = 'admin';
    await req.user.save();
    res.json({ message: 'You are now an admin! Log out and log back in to access the admin panel.', user: req.user.toJSON() });
  } catch (err) {
    console.error('Setup admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/setup/email-config', auth, adminOnly, async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!pass || !user) {
      return res.status(400).json({ message: 'API Key and sender email are required' });
    }
    const cleanKey = pass.replace(/\s/g, '');
    if (!cleanKey.startsWith('SG.')) {
      return res.status(400).json({ message: 'Invalid SendGrid API Key format. It should start with SG.' });
    }
    await configureEmail('smtp.sendgrid.net', 587, user, cleanKey);
    res.json({ message: 'Email configured with SendGrid' });
  } catch (err) {
    console.error('Email config error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/setup/test-email', auth, async (req, res) => {
  try {
    const { isConfigured, sendVerificationEmail } = require('./utils/email');
    const configured = await isConfigured();
    if (!configured) {
      return res.status(400).json({ message: 'Save email settings first before testing.' });
    }
    await sendVerificationEmail(req.user.email, '123456');
    res.json({ message: `Test email sent to ${req.user.email}. Check your inbox (and spam folder).` });
  } catch (err) {
    console.error('Test email error:', err.message, err.code);
    const msg = err.code === 'EENVELOPE'
      ? 'Sender email not verified in SendGrid. Add your sender in SendGrid dashboard.'
      : err.message || 'Failed to send.';
    res.status(500).json({ message: msg });
  }
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const buildPaths = [
  path.join(__dirname, '../../client/build'),
  path.join(__dirname, '../client/build'),
  path.join(process.cwd(), '../client/build'),
  path.join(process.cwd(), 'client/build'),
];

let buildPath = null;
for (const p of buildPaths) {
  if (fs.existsSync(p)) {
    buildPath = p;
    break;
  }
}

if (buildPath) {
  console.log('Serving static files from:', buildPath);
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.warn('Build folder not found. Tried:', buildPaths.join(', '));
  app.get('/', (req, res) => {
    res.send('<h1>𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤 API</h1><p>API is running. Frontend build not found.</p>');
  });
}

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

mongoose.connect(config.mongoUri)
  .then(async () => {
    console.log('MongoDB connected');
    await loadWebhooks();

    // Auto-seed products if DB is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products...');
      await Product.insertMany(seedProducts);
      console.log(`Seeded ${seedProducts.length} products`);
    }

    // Auto-seed a test coupon if none exist
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('Seeding test coupon...');
      await new Coupon({
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minAmount: 10,
        maxUses: 100,
        active: true,
      }).save();
      console.log('Seeded coupon SAVE20 (20% off)');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = app;
