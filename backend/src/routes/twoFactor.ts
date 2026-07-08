// 2FA routes - OTP setup, verify, and status
import { Router } from 'express';
import { body } from 'express-validator';
import { setup2FA, verify2FA, get2FAStatus, disable2FA } from '../controllers/twoFactorController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     tags: [2FA]
 *     summary: Request 2FA OTP
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent (mock OTP in response for demo)
 *       409:
 *         description: 2FA already enabled
 */
router.post('/setup', auth, setup2FA);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     tags: [2FA]
 *     summary: Verify OTP and enable 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify',
  auth,
  [body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')],
  validate,
  verify2FA
);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     tags: [2FA]
 *     summary: Check 2FA status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status
 */
router.get('/status', auth, get2FAStatus);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     tags: [2FA]
 *     summary: Disable 2FA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled
 */
router.post('/disable', auth, disable2FA);

export default router;
