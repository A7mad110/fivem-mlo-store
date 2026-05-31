const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createStripePaymentIntent } = require('../utils/payment');
const { sendOrderConfirmation } = require('../utils/email');
const { sendPurchase } = require('../utils/discord');

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod = 'stripe' } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, inStock: true });
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some products are unavailable' });
    }
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      const price = product.salePrice || product.price;
      return {
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity || 1,
      };
    });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      status: 'pending',
    });
    await order.save();
    let paymentIntent = null;
    if (paymentMethod === 'stripe') {
      try {
        paymentIntent = await createStripePaymentIntent(totalAmount, 'usd', {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        });
        order.paymentId = paymentIntent.id;
        await order.save();
      } catch (stripeErr) {
        console.error('Stripe error:', stripeErr.message);
      }
    }
    res.status(201).json({
      order,
      clientSecret: paymentIntent?.client_secret || null,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const order = await Order.findOne({ paymentId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'completed') return res.json({ message: 'Already completed', order });
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { salesCount: 1 } });
    }
    const user = await User.findById(req.user._id);
    user.purchases.push(order._id);
    await user.save();
    try {
      await sendOrderConfirmation(user.email, order);
    } catch (e) {
      console.error('Email send failed:', e);
    }
    try {
      const populatedOrder = await Order.findById(order._id).populate('items.product');
      sendPurchase(user, populatedOrder);
    } catch (e) {
      console.error('Discord notification failed:', e);
    }
    res.json({ message: 'Order confirmed', order });
  } catch (err) {
    console.error('Confirm order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name thumbnail slug')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
