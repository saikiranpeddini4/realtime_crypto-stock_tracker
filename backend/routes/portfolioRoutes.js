import express from 'express';
import { getPortfolio } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPortfolio);

export default router;
