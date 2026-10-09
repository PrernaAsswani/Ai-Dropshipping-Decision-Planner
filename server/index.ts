import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import productRoutes from './routes/products';
import supplierRoutes from './routes/suppliers';
import activityRoutes from './routes/activities';
import workflowRoutes from './routes/workflows';
import analysisRoutes from './routes/analysis';
import Supplier from './models/Supplier';
import Product from './models/Product';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000 // 5000 in dev
});
app.use('/api', limiter);

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Database connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('MONGODB_URI not set. Falling back to in-memory MongoDB for development.');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
    
    // Seed initial data if empty
    const count = await Supplier.countDocuments();
    if (count === 0) {
      console.log('[Startup] Seeding initial suppliers and products...');
      const s1 = await Supplier.create({ name: 'TechSource Global', rating: 4.8, deliveryTimeDays: 4, returnRate: 2.1, qualityScore: 94, priceLevel: 'Medium' });
      await Product.create({ name: 'Wireless Earbuds', category: 'Electronics', cost: 600, sellingPrice: 1999, additionalCost: 150, rating: 4.6, salesVolume: 'High', supplierId: s1._id });
      console.log('[Startup] Seeding completed.');
    } else {
      console.log(`[Startup] Database already seeded (${count} suppliers found). Skipping seed.`);
    }

  } catch (error) {
    console.error('[Startup] MongoDB connection error:', error);
    process.exit(1);
  }
};

// Health Check Endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Droplify API is running', health: '/health' });
});

// Start Server safely
const startServer = async () => {
  console.log('[Startup] Starting application initialization...');
  await connectDB();
  
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`[Startup] HTTP Server actively listening on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('[Startup] Unhandled rejection during server startup:', err);
  process.exit(1);
});
