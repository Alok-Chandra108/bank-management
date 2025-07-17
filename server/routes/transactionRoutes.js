import express from 'express';
import { getTransactionHistory } from '../controllers/transactionController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// ✅ GET /api/transactions/history
router.get('/history/:userId', protect, getTransactionHistory);

export default router;
