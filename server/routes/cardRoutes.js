import express from 'express';
import { createCard, getUserCards } from '../controllers/cardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createCard);      // Add new card
router.get('/', protect, getUserCards);     // Get cards of logged-in user

export default router;
