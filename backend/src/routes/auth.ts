// Auth routes - registration, login, and current user endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['entrepreneur', 'investor']).withMessage('Role must be entrepreneur or investor')
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['entrepreneur', 'investor']).withMessage('Role must be entrepreneur or investor')
  ],
  validate,
  login
);

router.get('/me', auth, getMe);

export default router;
