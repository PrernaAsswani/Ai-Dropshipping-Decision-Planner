import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Supplier from './models/Supplier.js';
import Activity from './models/Activity.js';
import Workflow from './models/Workflow.js';

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined. Please set it in your environment variables.');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Idempotency check: Don't seed if there's already significant data
    const existingSupplier = await Supplier.findOne({ name: 'Global Electro' });
    if (existingSupplier) {
      console.log('Demo data already exists (found Global Electro). Seed skipped to prevent duplicates.');
      process.exit(0);
    }

    console.log('Creating demo suppliers...');
    const suppliers = await Supplier.insertMany([
      { name: 'Global Electro', rating: 4.5, deliveryTimeDays: 7, returnRate: 3.0, qualityScore: 85, priceLevel: 'Medium' },
      { name: 'HomeGoods Express', rating: 4.9, deliveryTimeDays: 3, returnRate: 1.5, qualityScore: 98, priceLevel: 'High' },
      { name: 'Fashion Hub', rating: 3.8, deliveryTimeDays: 14, returnRate: 8.0, qualityScore: 65, priceLevel: 'Low' },
      { name: 'EcoPack Solutions', rating: 4.7, deliveryTimeDays: 5, returnRate: 1.0, qualityScore: 92, priceLevel: 'Medium' }
    ]);

    console.log('Creating demo products...');
    const products = await Product.insertMany([
      { name: 'Smart Fitness Watch', category: 'Electronics', cost: 400, sellingPrice: 1499, additionalCost: 100, rating: 4.2, salesVolume: 'Medium', supplierId: suppliers[0]._id },
      { name: 'Ergonomic Office Chair', category: 'Furniture', cost: 2000, sellingPrice: 5500, additionalCost: 500, rating: 4.8, salesVolume: 'High', supplierId: suppliers[1]._id },
      { name: 'Minimalist Leather Wallet', category: 'Fashion', cost: 150, sellingPrice: 799, additionalCost: 50, rating: 4.0, salesVolume: 'High', supplierId: suppliers[2]._id },
      { name: 'Portable Smoothie Blender', category: 'Kitchen', cost: 600, sellingPrice: 1499, additionalCost: 120, rating: 3.5, salesVolume: 'Low', supplierId: suppliers[0]._id },
      { name: 'Bamboo Cutlery Set', category: 'Eco-friendly', cost: 80, sellingPrice: 499, additionalCost: 20, rating: 4.9, salesVolume: 'Medium', supplierId: suppliers[3]._id }
    ]);

    console.log('Logging activity...');
    await Activity.create({
      message: 'System Initialized: Demo seed data populated in MongoDB.',
      timestamp: new Date()
    });

    console.log('Demo data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
