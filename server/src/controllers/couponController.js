const Coupon = require('../models/Coupon');

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minAmount, maxUses, expiresAt, categories } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ message: 'Code, type, and value are required' });
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ message: 'Type must be percentage or fixed' });
    }
    if (type === 'percentage' && (value <= 0 || value > 100)) {
      return res.status(400).json({ message: 'Percentage must be between 1 and 100' });
    }
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });
    const coupon = new Coupon({ code: code.toUpperCase(), type, value, minAmount, maxUses, expiresAt, categories });
    await coupon.save();
    res.status(201).json({ coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { code, type, value, minAmount, maxUses, expiresAt, active, categories } = req.body;
    const updates = {};
    if (code) updates.code = code.toUpperCase();
    if (type) updates.type = type;
    if (value !== undefined) updates.value = value;
    if (minAmount !== undefined) updates.minAmount = minAmount;
    if (maxUses !== undefined) updates.maxUses = maxUses;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;
    if (active !== undefined) updates.active = active;
    if (categories) updates.categories = categories;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ coupon });
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount, productCategories } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon has reached max uses' });
    }
    if (totalAmount < coupon.minAmount) {
      return res.status(400).json({ message: `Minimum order amount is $${coupon.minAmount.toFixed(2)}` });
    }
    if (coupon.categories && coupon.categories.length > 0 && productCategories) {
      const valid = productCategories.some(c => coupon.categories.includes(c));
      if (!valid) return res.status(400).json({ message: 'Coupon not applicable to items in cart' });
    }
    let discount = coupon.type === 'percentage' ? (totalAmount * coupon.value) / 100 : coupon.value;
    if (discount > totalAmount) discount = totalAmount;
    res.json({
      valid: true,
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
