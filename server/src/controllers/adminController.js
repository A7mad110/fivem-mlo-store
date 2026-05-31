const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendProductCreated, sendProductUpdated, sendProductDeleted } = require('../utils/discord');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().populate('user', 'username email').sort({ createdAt: -1 }).limit(5),
    ]);
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    res.json({ totalUsers, totalOrders, totalProducts, totalRevenue, recentOrders });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, shortDescription, price, salePrice, category, features, requirements, tags, thumbnail, images, inStock } = req.body;
    const product = new Product({
      name, slug, description, shortDescription, price, salePrice, category, thumbnail, images, inStock,
      features: features || [], requirements: requirements || [], tags: tags || [],
    });
    await product.save();
    sendProductCreated(product, req.user);
    res.status(201).json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const ALLOWED_PRODUCT_FIELDS = ['name', 'slug', 'description', 'shortDescription', 'price', 'salePrice', 'category', 'features', 'requirements', 'tags', 'images', 'inStock', 'thumbnail'];

exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });
    const updates = {};
    for (const key of ALLOWED_PRODUCT_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    sendProductUpdated(product, oldProduct, req.user);
    res.json({ product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    sendProductDeleted(product, req.user);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && typeof status === 'string') query.status = status.slice(0, 50);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const ALLOWED_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);
    const orders = await Order.find({ user: { $in: userIds }, status: 'completed' })
      .populate('items.product', 'name slug thumbnail price')
      .sort({ createdAt: -1 });
    const userOrders = {};
    for (const order of orders) {
      const uid = order.user.toString();
      if (!userOrders[uid]) userOrders[uid] = [];
      userOrders[uid].push(order);
    }
    const enriched = users.map(u => ({
      ...u.toJSON(),
      orders: userOrders[u._id.toString()] || [],
    }));
    res.json({ users: enriched });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const ALLOWED_ROLES = ['user', 'admin'];

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await Order.deleteMany({ user: targetUser._id });
    await User.findByIdAndDelete(targetUser._id);
    res.json({ message: 'User and their orders deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
