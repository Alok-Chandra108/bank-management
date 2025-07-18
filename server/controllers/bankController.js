// In your controllers/bankController.js
import BankAccount from '../models/BankAccount.js';
import User from '../models/User.js'; // Assuming you might need User model elsewhere in this file, kept for consistency

export const createAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const existing = await BankAccount.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists' });
    }

    // Generate a 9-digit account number (ensure uniqueness in a real app, e.g., by retrying on collision)
    const accountNumber = 'BA' + Math.floor(100000000 + Math.random() * 900000000);

    const account = await BankAccount.create({
      user: userId,
      accountNumber,
      balance: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Account created',
      data: account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const account = await BankAccount.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Account fetched',
      data: account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// deposit, withdraw, and transfer are removed from here and moved to transactionController.js