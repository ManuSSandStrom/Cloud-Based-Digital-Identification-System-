import { Router } from 'express';
import {
  downloadIdCard,
  getProfile,
  getUserDashboard,
  getVerificationHistory,
  uploadDocuments,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadIdentityFiles } from '../middleware/uploadMiddleware.js';
import { ACCOUNT_TYPES } from '../utils/constants.js';

const router = Router();

router.use(protect([ACCOUNT_TYPES.USER]));

router.get('/profile', getProfile);
router.get('/dashboard', getUserDashboard);
router.post('/upload-documents', uploadIdentityFiles, uploadDocuments);
router.get('/download-id', downloadIdCard);
router.get('/verification-history', getVerificationHistory);

export default router;
