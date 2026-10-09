import express from 'express';
import Workflow from '../models/Workflow';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ productId: req.params.productId });
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/product/:productId', async (req, res) => {
  try {
    const { status, steps } = req.body;
    let workflow = await Workflow.findOne({ productId: req.params.productId });
    
    if (workflow) {
      workflow.status = status;
      workflow.steps = steps;
      workflow.updatedAt = new Date();
    } else {
      workflow = new Workflow({
        productId: req.params.productId,
        status,
        steps
      });
    }
    
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request' });
  }
});

export default router;
