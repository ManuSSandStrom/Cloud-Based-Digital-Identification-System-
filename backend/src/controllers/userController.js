import User from '../models/User.js';
import VerificationLog from '../models/VerificationLog.js';
import ActivityLog from '../models/ActivityLog.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadFile } from '../services/storageService.js';
import { generateIdPdf } from '../services/pdfService.js';
import { ACCOUNT_TYPES } from '../utils/constants.js';
import { logActivity } from '../services/activityService.js';

const getUserOrFail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserOrFail(req.auth.sub);

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

export const getUserDashboard = asyncHandler(async (req, res) => {
  const user = await getUserOrFail(req.auth.sub);
  const [verificationHistory, recentActivities] = await Promise.all([
    VerificationLog.find({ userId: user._id })
      .populate('organizationId', 'name email')
      .sort({ timestamp: -1 })
      .limit(10),
    ActivityLog.find({
      actorId: user._id,
      actorType: ACCOUNT_TYPES.USER,
    })
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  res.json({
    success: true,
    data: {
      profile: user.toJSON(),
      stats: {
        documentCount: user.documents.length,
        verificationCount: verificationHistory.length,
        lastLoginAt: user.lastLoginAt,
        kycCompleted: user.isKycComplete,
      },
      verificationHistory,
      recentActivities,
    },
  });
});

export const uploadDocuments = asyncHandler(async (req, res) => {
  const user = await getUserOrFail(req.auth.sub);

  const files = req.files || {};
  const profileFile = files.profileImage?.[0];
  const documentFiles = files.documents || [];

  if (req.body.name) {
    user.name = req.body.name;
  }

  if (req.body.dob) {
    user.dob = req.body.dob;
  }

  if (req.body.address) {
    user.address = req.body.address;
  }

  if (profileFile) {
    user.profileImage = await uploadFile(profileFile, `users/${user._id}/profile`);
  }

  if (documentFiles.length) {
    const uploadedDocuments = await Promise.all(
      documentFiles.map(async (file) => ({
        name: file.originalname,
        ...(await uploadFile(file, `users/${user._id}/documents`)),
      })),
    );
    user.documents = [...user.documents, ...uploadedDocuments];
  }

  user.isKycComplete = Boolean(user.profileImage?.url && user.documents.length);
  await user.save();

  await logActivity({
    actorId: user._id,
    actorType: ACCOUNT_TYPES.USER,
    action: 'profile_updated',
    ip: req.ip,
    metadata: {
      uploadedDocuments: documentFiles.length,
      updatedProfileImage: Boolean(profileFile),
    },
  });

  res.json({
    success: true,
    message: 'Profile and documents updated successfully.',
    data: user.toJSON(),
  });
});

export const downloadIdCard = asyncHandler(async (req, res) => {
  const user = await getUserOrFail(req.auth.sub);
  const pdfBuffer = await generateIdPdf(user);

  await logActivity({
    actorId: user._id,
    actorType: ACCOUNT_TYPES.USER,
    action: 'id_downloaded',
    ip: req.ip,
    metadata: { uniqueID: user.uniqueID },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${user.uniqueID || 'digital-id'}.pdf"`,
  );
  res.send(pdfBuffer);
});

export const getVerificationHistory = asyncHandler(async (req, res) => {
  const user = await getUserOrFail(req.auth.sub);
  const verificationHistory = await VerificationLog.find({ userId: user._id })
    .populate('organizationId', 'name email')
    .sort({ timestamp: -1 });

  res.json({
    success: true,
    data: verificationHistory,
  });
});
