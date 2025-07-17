import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer'],
      default: 'transfer',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
