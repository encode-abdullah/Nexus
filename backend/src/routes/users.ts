// User routes - profile management endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { updateUser, getUserById, getAllUsers } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [entrepreneur, investor]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               startupName:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *       403:
 *         description: Cannot update other user's profile
 */
router.put('/:id',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().trim(),
    body('startupName').optional().trim(),
    body('pitchSummary').optional().trim(),
    body('fundingNeeded').optional().trim(),
    body('industry').optional().trim(),
    body('location').optional().trim(),
    body('foundedYear').optional().isNumeric().withMessage('Founded year must be a number'),
    body('teamSize').optional().isNumeric().withMessage('Team size must be a number'),
    body('investmentInterests').optional().isArray(),
    body('investmentStage').optional().isArray(),
    body('portfolioCompanies').optional().isArray(),
    body('totalInvestments').optional().isNumeric(),
    body('minimumInvestment').optional().trim(),
    body('maximumInvestment').optional().trim()
  ],
  validate,
  updateUser
);

export default router;
