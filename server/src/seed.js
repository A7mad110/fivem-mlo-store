const mongoose = require('mongoose');
const Product = require('./models/Product');
const config = require('./config');
const products = require('./data/products');

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products successfully`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
