// In your routes/transactionRoutes.js
import express from 'express';
import { getTransactionHistory, deposit, withdraw, transferMoney } from '../controllers/transactionController.js'; // Ensure correct import for transferMoney
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/transactions/history
router.get('/history', protect, getTransactionHistory);
router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);
router.post('/transfer', protect, transferMoney);

export default router;