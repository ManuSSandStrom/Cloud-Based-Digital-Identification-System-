import { Router } from 'express';
import {
  approveOrganization,
  getAdminDashboard,
  getSystemLogs,
  listOrganizations,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { ACCOUNT_TYPES } from '../utils/constants.js';

const router = Router();

router.use(protect([ACCOUNT_TYPES.ADMIN]));

router.get('/dashboard', getAdminDashboard);
router.get('/organizations', listOrganizations);
router.put('/approve-org', approveOrganization);
router.get('/logs', getSystemLogs);

export default router;
