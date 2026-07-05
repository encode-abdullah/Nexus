// User routes - profile management endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { updateUser, getUserById, getAllUsers } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);

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
