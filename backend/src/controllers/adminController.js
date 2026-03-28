import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import VerificationLog from '../models/VerificationLog.js';
import ActivityLog from '../models/ActivityLog.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ACCOUNT_TYPES } from '../utils/constants.js';
import { buildMonthlySeries } from '../services/analyticsService.js';
import { logActivity } from '../services/activityService.js';
import { notifyOrganizationStatus } from './organizationController.js';

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.auth.sub);
  if (!admin) {
    throw new AppError('Admin not found.', 404);
  }

  const [users, organizations, verificationRecords, allVerificationRecords, recentLogs] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    Organization.find().sort({ createdAt: -1 }),
    VerificationLog.find()
      .sort({ timestamp: -1 })
      .limit(8)
      .populate('userId organizationId', 'name uniqueID email'),
    VerificationLog.find().sort({ timestamp: -1 }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(12),
  ]);

  res.json({
    success: true,
    data: {
      admin,
      stats: {
        totalUsers: users.length,
        totalStudents: users.filter((user) => user.role === 'student').length,
        totalFaculty: users.filter((user) => user.role === 'faculty').length,
        totalOrganizations: organizations.length,
        pendingOrganizations: organizations.filter((org) => org.status === 'pending').length,
        approvedOrganizations: organizations.filter((org) => org.status === 'approved').length,
        totalVerifications: await VerificationLog.countDocuments(),
      },
      organizations,
      recentVerifications: verificationRecords,
      recentLogs,
      analytics: {
        registrationSeries: buildMonthlySeries(users),
        verificationSeries: buildMonthlySeries(
          allVerificationRecords.map((item) => ({ createdAt: item.timestamp })),
        ),
      },
    },
  });
});

export const listOrganizations = asyncHandler(async (_req, res) => {
  const organizations = await Organization.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: organizations,
  });
});

export const approveOrganization = asyncHandler(async (req, res) => {
  const { organizationId, status } = req.body;

  if (!organizationId || !['approved', 'rejected'].includes(status)) {
    throw new AppError('Organization ID and valid status are required.', 400);
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new AppError('Organization not found.', 404);
  }

  organization.status = status;
  organization.approvedAt = status === 'approved' ? new Date() : null;
  organization.approvedBy = req.auth.sub;
  await organization.save();

  await Promise.allSettled([
    notifyOrganizationStatus(organization),
    logActivity({
      actorId: req.auth.sub,
      actorType: ACCOUNT_TYPES.ADMIN,
      action: 'organization_status_updated',
      ip: req.ip,
      metadata: {
        organizationId,
        status,
      },
    }),
  ]);

  res.json({
    success: true,
    message: `Organization ${status} successfully.`,
    data: organization,
  });
});

export const getSystemLogs = asyncHandler(async (_req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);

  res.json({
    success: true,
    data: logs,
  });
});
