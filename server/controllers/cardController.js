import Card from '../models/Card.js';

// Helper to generate dummy 16-digit card number
const generateCardNumber = () => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 10));
};

// Helper to generate expiry (2 years from now)
const generateExpiryDate = () => {
  const now = new Date();
  return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear() + 2}`;
};

// @desc   Create a new card
// @route  POST /api/cards
// @access Private (Requires auth middleware)
export const createCard = async (req, res) => {
  try {
    // Check if card already exists for user
    const existing = await Card.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ error: 'Card already requested or issued.' });
    }

    const card = new Card({
      user: req.user._id,
      cardNumber: generateCardNumber(),
      expiry: generateExpiryDate(),
      cardHolder: req.user.name || 'Card Holder',
      type: 'RuPay',
      issuedAt: Date.now(),
      status: 'pending'
    });

    const savedCard = await card.save();
    res.status(201).json(savedCard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc   Get all cards for current user
// @route  GET /api/cards
// @access Private
export const getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id });

    // Check if 24 hours have passed since issuedAt
    const updatedCards = await Promise.all(
      cards.map(async (card) => {
        if (card.status === 'pending') {
          const now = new Date();
          const issuedTime = new Date(card.issuedAt);
          const timeDiff = now - issuedTime;

          if (timeDiff >= 24 * 60 * 60 * 1000) {
            card.status = 'active';
            await card.save();
          }
        }
        return card;
      })
    );

    res.status(200).json(updatedCards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
