// Transaction model - stores payment transactions with status tracking
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  recipientId?: mongoose.Types.ObjectId;
  stripePaymentId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ITransactionDocument extends ITransaction, Document {}

const transactionSchema = new Schema<ITransactionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
  stripePaymentId: { type: String },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
