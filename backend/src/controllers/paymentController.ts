// Payment controller - handles deposits, withdrawals, transfers, and transaction history
import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[DEPOSIT] User:', req.user?._id, 'Body:', req.body);
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { amount, currency = 'USD' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      currency,
      status: 'completed',
      stripePaymentId: `pi_sandbox_${Date.now()}`,
      description: `Deposit of ${amount} ${currency}`
    });

    console.log('[DEPOSIT] Created transaction:', transaction._id);
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('[DEPOSIT] Error:', error);
    res.status(500).json({ error: 'Deposit failed' });
  }
};

export const createWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { amount, currency = 'USD' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'withdraw',
      amount,
      currency,
      status: 'completed',
      description: `Withdrawal of ${amount} ${currency}`
    });

    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
};

export const createTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { toUserId, amount, currency = 'USD' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    if (!toUserId) {
      res.status(400).json({ error: 'Recipient is required' });
      return;
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'transfer',
      amount,
      currency,
      status: 'completed',
      recipientId: toUserId,
      description: `Transfer of ${amount} ${currency} to ${recipient.name}`
    });

    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    console.log('[TXNS] Fetching for user:', req.user._id);
    const transactions = await Transaction.find({
      $or: [
        { userId: req.user._id },
        { recipientId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    console.log('[TXNS] Found:', transactions.length);
    res.json({ transactions });
  } catch (error) {
    console.error('[TXNS] Error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    console.log('[BALANCE] Fetching for user:', req.user._id);
    const transactions = await Transaction.find({
      userId: req.user._id,
      status: 'completed'
    });

    console.log('[BALANCE] Found transactions:', transactions.length);
    const balance = transactions.reduce((total, tx) => {
      if (tx.type === 'deposit') return total + tx.amount;
      if (tx.type === 'withdraw' || tx.type === 'transfer') return total - tx.amount;
      return total;
    }, 0);

    console.log('[BALANCE] Calculated:', balance);
    res.json({ balance: Math.max(0, balance) });
  } catch (error) {
    console.error('[BALANCE] Error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
};
