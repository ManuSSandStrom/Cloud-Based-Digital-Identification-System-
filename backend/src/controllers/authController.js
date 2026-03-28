import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ACCOUNT_TYPES, OTP_PURPOSES, USER_ROLES } from '../utils/constants.js';
import { signToken } from '../utils/jwt.js';
import { generateUniqueId, generateUserQrCode } from '../services/idService.js';
import { sendEmail } from '../services/emailService.js';
import {
  idGeneratedTemplate,
  loginAlertTemplate,
  otpEmailTemplate,
  registrationEmailTemplate,
} from '../templates/emailTemplates.js';
import { createOtp, verifyOtp } from '../services/otpService.js';
import { logActivity } from '../services/activityService.js';

const getIpAddress = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket.remoteAddress ||
  'unknown';

const recordLoginActivity = async (account, req) => {
  account.lastLoginAt = new Date();
  account.loginActivities = [
    {
      ip: getIpAddress(req),
      userAgent: req.headers['user-agent'],
      loggedInAt: new Date(),
    },
    ...(account.loginActivities || []),
  ].slice(0, 10);

  await account.save();
};

const buildAuthResponse = (account, accountType) => ({
  token: signToken({
    sub: account._id,
    accountType,
    role: account.role || account.status || 'admin',
    email: account.email,
  }),
  accountType,
  user:
    typeof account.toJSON === 'function'
      ? account.toJSON()
      : {
          ...account,
        },
});

const findAccountByEmail = async (email, accountType, includePassword = false) => {
  const query = { email: email.toLowerCase() };
  const projection = includePassword ? '+password' : '';

  switch (accountType) {
    case ACCOUNT_TYPES.USER:
      return User.findOne(query).select(projection);
    case ACCOUNT_TYPES.ORGANIZATION:
      return Organization.findOne(query).select(projection);
    case ACCOUNT_TYPES.ADMIN:
      return Admin.findOne(query).select(projection);
    default:
      return null;
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError('Name, email, password, and role are required.', 400);
  }

  if (!USER_ROLES.includes(role)) {
    throw new AppError('Role must be either student or faculty.', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const uniqueID = await generateUniqueId();
  const qrCodeDataUrl = await generateUserQrCode(uniqueID);

  const user = await User.create({
    name,
    email,
    password,
    role,
    uniqueID,
    qrCodeDataUrl,
    idIssuedAt: new Date(),
  });

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: 'Registration Successful',
      html: registrationEmailTemplate({ name: user.name, uniqueID }),
    }),
    sendEmail({
      to: user.email,
      subject: 'Your Digital ID Is Ready',
      html: idGeneratedTemplate({ name: user.name, uniqueID }),
    }),
    logActivity({
      actorId: user._id,
      actorType: ACCOUNT_TYPES.USER,
      action: 'user_registered',
      ip: getIpAddress(req),
      metadata: { uniqueID, role },
    }),
  ]);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: buildAuthResponse(user, ACCOUNT_TYPES.USER),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, accountType } = req.body;

  if (!email || !password || !accountType) {
    throw new AppError('Email, password, and account type are required.', 400);
  }

  const account = await findAccountByEmail(email, accountType, true);

  if (!account || !(await account.comparePassword(password))) {
    throw new AppError('Invalid login credentials.', 401);
  }

  await recordLoginActivity(account, req);

  await Promise.allSettled([
    sendEmail({
      to: account.email,
      subject: 'Login Alert',
      html: loginAlertTemplate({
        name: account.name,
        ip: getIpAddress(req),
        loggedInAt: new Date(),
      }),
    }),
    logActivity({
      actorId: account._id,
      actorType: accountType,
      action: 'account_logged_in',
      ip: getIpAddress(req),
      metadata: { email: account.email },
    }),
  ]);

  res.json({
    success: true,
    message: 'Login successful.',
    data: buildAuthResponse(account, accountType),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, accountType } = req.body;

  if (!email || !accountType) {
    throw new AppError('Email and account type are required.', 400);
  }

  const account = await findAccountByEmail(email, accountType);

  if (!account) {
    throw new AppError('Account not found for this email.', 404);
  }

  const otp = await createOtp({
    email: account.email,
    accountType,
    purpose: OTP_PURPOSES.PASSWORD_RESET,
  });

  await sendEmail({
    to: account.email,
    subject: 'Reset Password OTP',
    html: otpEmailTemplate({
      name: account.name,
      otp,
      purpose: 'password reset',
    }),
  });

  res.json({
    success: true,
    message: 'OTP sent to your email.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, accountType, otp, newPassword } = req.body;

  if (!email || !accountType || !otp || !newPassword) {
    throw new AppError('Email, account type, OTP, and new password are required.', 400);
  }

  const account = await findAccountByEmail(email, accountType, true);
  if (!account) {
    throw new AppError('Account not found.', 404);
  }

  const isOtpValid = await verifyOtp({
    email: account.email,
    accountType,
    purpose: OTP_PURPOSES.PASSWORD_RESET,
    code: otp,
  });

  if (!isOtpValid) {
    throw new AppError('Invalid or expired OTP.', 400);
  }

  account.password = newPassword;
  await account.save();

  await logActivity({
    actorId: account._id,
    actorType: accountType,
    action: 'password_reset',
    ip: getIpAddress(req),
    metadata: { email: account.email },
  });

  res.json({
    success: true,
    message: 'Password reset successfully.',
  });
});
