import { Router } from 'express';
import {
  forgotPassword,
  login,
  registerUser,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
