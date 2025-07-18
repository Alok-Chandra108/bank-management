// In your routes/bankRoutes.js
import express from 'express';
import {
  createAccount,
  getAccount,
} from '../controllers/bankController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createAccount);
router.get('/me', protect, getAccount);

export default router;