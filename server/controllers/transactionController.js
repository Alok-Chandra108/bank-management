// In your controllers/transactionController.js
import User from '../models/User.js'; // Keep for consistency if needed in future
import Transaction from '../models/Transaction.js';
import BankAccount from '../models/BankAccount.js';

// Deposit Money
export const deposit = async (req, res) => {
  const userId = req.user.id; // Consistent userId access
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const account = await BankAccount.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.balance += amount;
    await account.save();

    // ✅ Add Transaction Record
    await Transaction.create({
      to: userId, // 'to' is appropriate for deposit as money comes to this user
      amount,
      type: 'deposit',
      description: `Deposited ₹${amount}`,
    });

    res.status(200).json({
      success: true,
      message: `Deposited ₹${amount}`,
      data: account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Withdraw Money
export const withdraw = async (req, res) => {
  const userId = req.user.id; // Consistent userId access
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const account = await BankAccount.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    account.balance -= amount;
    await account.save();

    // ✅ Add Transaction Record
    await Transaction.create({
      from: userId, // 'from' is appropriate for withdraw as money goes from this user
      amount,
      type: 'withdraw',
      description: `Withdrew ₹${amount}`,
    });

    res.status(200).json({
      success: true,
      message: `Withdrew ₹${amount}`,
      data: account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Transfer Money
export const transferMoney = async (req, res) => { // Renamed from 'transfer' to 'transferMoney' for clarity and to avoid conflict with existing 'transfer' if any
  try {
    const fromUserId = req.user.id; // Consistent userId access
    const { accountNumber, amount, description } = req.body; // Using accountNumber for recipient

    if (!accountNumber || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer details' }); // Consistent response format
    }

    const fromAccount = await BankAccount.findOne({ user: fromUserId });
    const toAccount = await BankAccount.findOne({ accountNumber }).populate('user'); // Populate user for transaction record if needed

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ success: false, message: 'One or both accounts not found' }); // Consistent response format
    }

    if (fromAccount.accountNumber === toAccount.accountNumber) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    const txn = await Transaction.create({
      from: fromUserId,
      to: toAccount.user._id, // Use the actual user ID from the populated receiver account
      amount,
      type: 'transfer',
      description: description || `Transferred ₹${amount} to ${toAccount.user.name || 'another user'}`, // Enhanced description
    });

    res.status(200).json({ success: true, message: 'Transfer successful', transaction: txn }); // Consistent response format
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ success: false, message: 'Transfer failed', error: err.message }); // Consistent response format
  }
};

// Get All Transactions for Current User
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Consistent userId access

    const transactions = await Transaction.find({
      $or: [
        { from: userId },
        { to: userId },
      ]
    })
      .sort({ createdAt: -1 })
      .populate('from', 'name email')
      .populate('to', 'name email');

    res.status(200).json({ success: true, data: transactions }); // Added success: true for consistency
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: err.message }); // Consistent response format
  }
};