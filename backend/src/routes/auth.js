import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updatePreferences } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticate, getMe);
router.patch('/preferences', authenticate, updatePreferences);

export default router;
