import Organization from '../models/Organization.js';
import User from '../models/User.js';
import VerificationLog from '../models/VerificationLog.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ACCOUNT_TYPES, OTP_PURPOSES } from '../utils/constants.js';
import { sendEmail } from '../services/emailService.js';
import { createOtp, verifyOtp } from '../services/otpService.js';
import { logActivity } from '../services/activityService.js';
import { organizationStatusTemplate, otpEmailTemplate } from '../templates/emailTemplates.js';

const buildVerificationPayload = (user) => ({
  _id: user._id,
  uniqueID: user.uniqueID,
  name: user.name,
  role: user.role,
  dob: user.dob,
  address: user.address,
  profileImage: user.profileImage,
  documents: user.documents,
  idIssuedAt: user.idIssuedAt,
});

export const registerOrganization = asyncHandler(async (req, res) => {
  const { name, email, password, contactPerson, phone, address } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Organization name, email, and password are required.', 400);
  }

  const existingOrganization = await Organization.findOne({ email: email.toLowerCase() });
  if (existingOrganization) {
    throw new AppError('An organization with this email already exists.', 409);
  }

  const organization = await Organization.create({
    name,
    email,
    password,
    contactPerson,
    phone,
    address,
  });

  await logActivity({
    actorId: organization._id,
    actorType: ACCOUNT_TYPES.ORGANIZATION,
    action: 'organization_registered',
    ip: req.ip,
    metadata: { status: organization.status },
  });

  res.status(201).json({
    success: true,
    message: 'Organization registration submitted for admin approval.',
    data: organization,
  });
});

export const getOrganizationDashboard = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.auth.sub);
  if (!organization) {
    throw new AppError('Organization not found.', 404);
  }

  const recentVerifications = await VerificationLog.find({
    organizationId: organization._id,
  })
    .populate('userId', 'name uniqueID role profileImage')
    .sort({ timestamp: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      organization,
      stats: {
        verificationCount: organization.verificationCount,
        approved: organization.status === 'approved',
        lastLoginAt: organization.lastLoginAt,
      },
      recentVerifications,
    },
  });
});

export const verifyUserByQr = asyncHandler(async (req, res) => {
  const user = await User.findOne({ uniqueID: req.params.id });

  if (!user) {
    throw new AppError('No user found for this digital ID.', 404);
  }

  await VerificationLog.create({
    userId: user._id,
    organizationId: req.organization._id,
    status: 'success',
    method: 'qr',
  });

  req.organization.verificationCount += 1;
  await req.organization.save();

  await logActivity({
    actorId: req.organization._id,
    actorType: ACCOUNT_TYPES.ORGANIZATION,
    action: 'user_verified_qr',
    ip: req.ip,
    metadata: { uniqueID: user.uniqueID },
  });

  res.json({
    success: true,
    message: 'Identity verified successfully.',
    data: buildVerificationPayload(user),
  });
});

export const requestVerificationOtp = asyncHandler(async (req, res) => {
  const { uniqueID } = req.body;

  if (!uniqueID) {
    throw new AppError('Unique ID is required.', 400);
  }

  const user = await User.findOne({ uniqueID });
  if (!user) {
    throw new AppError('No user found for this digital ID.', 404);
  }

  const otp = await createOtp({
    email: user.email,
    accountType: ACCOUNT_TYPES.USER,
    purpose: OTP_PURPOSES.IDENTITY_VERIFICATION,
    metadata: {
      uniqueID,
      organizationId: String(req.organization._id),
    },
  });

  await sendEmail({
    to: user.email,
    subject: 'Digital ID Verification OTP',
    html: otpEmailTemplate({
      name: user.name,
      otp,
      purpose: `identity verification by ${req.organization.name}`,
    }),
  });

  res.json({
    success: true,
    message: 'Verification OTP sent to the user email.',
  });
});

export const verifyUserByOtp = asyncHandler(async (req, res) => {
  const { uniqueID, otp } = req.body;

  if (!uniqueID || !otp) {
    throw new AppError('Unique ID and OTP are required.', 400);
  }

  const user = await User.findOne({ uniqueID });
  if (!user) {
    throw new AppError('No user found for this digital ID.', 404);
  }

  const isOtpValid = await verifyOtp({
    email: user.email,
    accountType: ACCOUNT_TYPES.USER,
    purpose: OTP_PURPOSES.IDENTITY_VERIFICATION,
    code: otp,
    metadataMatcher: {
      uniqueID,
      organizationId: String(req.organization._id),
    },
  });

  await VerificationLog.create({
    userId: user._id,
    organizationId: req.organization._id,
    status: isOtpValid ? 'success' : 'failed',
    method: 'otp',
  });

  if (!isOtpValid) {
    throw new AppError('Invalid or expired verification OTP.', 400);
  }

  req.organization.verificationCount += 1;
  await req.organization.save();

  await logActivity({
    actorId: req.organization._id,
    actorType: ACCOUNT_TYPES.ORGANIZATION,
    action: 'user_verified_otp',
    ip: req.ip,
    metadata: { uniqueID: user.uniqueID },
  });

  res.json({
    success: true,
    message: 'Identity verified successfully.',
    data: buildVerificationPayload(user),
  });
});

export const notifyOrganizationStatus = async (organization) =>
  sendEmail({
    to: organization.email,
    subject: 'Organization Account Status Updated',
    html: organizationStatusTemplate({
      name: organization.name,
      status: organization.status,
    }),
  });
