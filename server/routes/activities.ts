import express from 'express';
import Activity from '../models/Activity';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(20);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
