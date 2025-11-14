const mongoose = require('mongoose');
const Product = require('../models/Product');
const products = require('../data/products.json');

require('dotenv').config();

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/abc-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Display inserted products
    console.log('Products seeded:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();