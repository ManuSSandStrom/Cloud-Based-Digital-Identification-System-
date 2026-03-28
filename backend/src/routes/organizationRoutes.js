import { Router } from 'express';
import {
  getOrganizationDashboard,
  registerOrganization,
  requestVerificationOtp,
  verifyUserByOtp,
  verifyUserByQr,
} from '../controllers/organizationController.js';
import { ensureApprovedOrganization, protect } from '../middleware/authMiddleware.js';
import { ACCOUNT_TYPES } from '../utils/constants.js';

const router = Router();

router.post('/register', registerOrganization);
router.get('/dashboard', protect([ACCOUNT_TYPES.ORGANIZATION]), getOrganizationDashboard);
router.get(
  '/verify/:id',
  protect([ACCOUNT_TYPES.ORGANIZATION]),
  ensureApprovedOrganization,
  verifyUserByQr,
);
router.post(
  '/request-otp',
  protect([ACCOUNT_TYPES.ORGANIZATION]),
  ensureApprovedOrganization,
  requestVerificationOtp,
);
router.post(
  '/verify-otp',
  protect([ACCOUNT_TYPES.ORGANIZATION]),
  ensureApprovedOrganization,
  verifyUserByOtp,
);

export default router;
