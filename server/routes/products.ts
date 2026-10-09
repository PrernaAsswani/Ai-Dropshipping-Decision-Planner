import express from 'express';
import Product from '../models/Product';
import Activity from '../models/Activity';
import Workflow from '../models/Workflow';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    await Activity.create({ message: `New product added: ${savedProduct.name}` });
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    await Activity.create({ message: `Product updated: ${product.name}` });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Also delete associated workflows
    await Workflow.deleteMany({ productId: req.params.id });
    
    await Activity.create({ message: `Product deleted: ${product.name}` });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
