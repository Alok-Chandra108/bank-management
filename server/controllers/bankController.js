import BankAccount from '../models/BankAccount.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const createAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const existing = await BankAccount.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists' });
    }

    const accountNumber = 'BA' + Math.floor(100000000 + Math.random() * 900000000); // 9-digit

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

export const deposit = async (req, res) => {
  const userId = req.user.id;
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

export const withdraw = async (req, res) => {
  const userId = req.user.id;
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

export const transfer = async (req, res) => {
  const senderId = req.user.id;
  const { accountNumber, amount } = req.body;

  if (!accountNumber || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    const senderAccount = await BankAccount.findOne({ user: senderId });
    const receiverAccount = await BankAccount.findOne({ accountNumber }).populate('user');

    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (senderAccount.accountNumber === receiverAccount.accountNumber) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same account' });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct and add
    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    await senderAccount.save();
    await receiverAccount.save();

    await Transaction.create({
      from: senderAccount.user,
      to: receiverAccount.user._id,
      amount,
    });

    res.status(200).json({ success: true, message: `Transferred ₹${amount}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};