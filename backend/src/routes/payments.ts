// Payment routes - transactions, balance, deposit, withdraw, transfer
import { Router } from 'express';
import { body } from 'express-validator';
import { getBalance, createDeposit, createWithdrawal, createTransfer, getTransactions } from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

/**
 * @swagger
 * /api/payments/balance:
 *   get:
 *     tags: [Payments]
 *     summary: Get current balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 */
router.get('/balance', auth, getBalance);

/**
 * @swagger
 * /api/payments/transactions:
 *   get:
 *     tags: [Payments]
 *     summary: Get transaction history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', auth, getTransactions);

/**
 * @swagger
 * /api/payments/deposit:
 *   post:
 *     tags: [Payments]
 *     summary: Deposit funds
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, paymentMethod]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deposit successful
 */
router.post('/deposit',
  auth,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('description').optional().trim()
  ],
  validate,
  createDeposit
);

/**
 * @swagger
 * /api/payments/withdraw:
 *   post:
 *     tags: [Payments]
 *     summary: Withdraw funds
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal successful
 *       400:
 *         description: Insufficient funds
 */
router.post('/withdraw',
  auth,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('description').optional().trim()
  ],
  validate,
  createWithdrawal
);

/**
 * @swagger
 * /api/payments/transfer:
 *   post:
 *     tags: [Payments]
 *     summary: Transfer funds to another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, toUserId]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               toUserId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transfer successful
 *       400:
 *         description: Insufficient funds or invalid recipient
 */
router.post('/transfer',
  auth,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('toUserId').notEmpty().withMessage('Recipient is required'),
    body('description').optional().trim()
  ],
  validate,
  createTransfer
);

export default router;
