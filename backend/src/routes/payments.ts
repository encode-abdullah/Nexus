// Payment routes - deposit, withdraw, transfer, and transaction history endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { createDeposit, createWithdrawal, createTransfer, getTransactions, getBalance } from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

router.post('/deposit',
  auth,
  [
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => {
      if (value <= 0) throw new Error('Amount must be positive');
      return true;
    })
  ],
  validate,
  createDeposit
);

router.post('/withdraw',
  auth,
  [
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => {
      if (value <= 0) throw new Error('Amount must be positive');
      return true;
    })
  ],
  validate,
  createWithdrawal
);

router.post('/transfer',
  auth,
  [
    body('recipientId').notEmpty().withMessage('Recipient is required'),
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => {
      if (value <= 0) throw new Error('Amount must be positive');
      return true;
    })
  ],
  validate,
  createTransfer
);

router.get('/transactions', auth, getTransactions);
router.get('/balance', auth, getBalance);

export default router;
