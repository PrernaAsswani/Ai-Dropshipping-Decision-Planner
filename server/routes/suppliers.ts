import express from 'express';
import Supplier from '../models/Supplier';
import Activity from '../models/Activity';

const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add new supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    
    // Log activity
    await Activity.create({ message: `New supplier added: ${savedSupplier.name}` });
    
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request' });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    
    await Activity.create({ message: `Supplier updated: ${supplier.name}` });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request' });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    
    await Activity.create({ message: `Supplier deleted: ${supplier.name}` });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
