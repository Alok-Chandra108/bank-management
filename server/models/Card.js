import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  expiry: {
    type: String,
    required: true
  },
  cardHolder: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Visa', 'MasterCard', 'RuPay'],
    default: 'RuPay'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending'
  }
});

const Card = mongoose.model('Card', cardSchema);
export default Card;
