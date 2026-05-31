const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  category: { type: String, required: true, enum: ['maps', 'mlo', 'interior', 'exterior', 'build', 'other'] },
  images: [{ type: String }],
  thumbnail: { type: String, default: '' },
  features: [String],
  requirements: [String],
  version: { type: String, default: '1.0.0' },
  fileSize: { type: String, default: '' },
  downloadUrl: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  salesCount: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
