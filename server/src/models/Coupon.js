const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  currentUses: { type: Number, default: 0 },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  categories: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', couponSchema);
