import express from 'express';
import {
  createAccount,
  getAccount,
  deposit,
  withdraw,
  transfer 
} from '../controllers/bankController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createAccount);
router.get('/me', protect, getAccount);
router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw); 
router.post('/transfer', protect, transfer);

export default router;
