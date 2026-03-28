import OtpToken from '../models/OtpToken.js';
import { hashOtpCode } from '../utils/crypto.js';

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const createOtp = async ({
  email,
  accountType,
  purpose,
  metadata = {},
  ttlMinutes = 10,
}) => {
  await OtpToken.deleteMany({
    email,
    accountType,
    purpose,
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await OtpToken.create({
    email,
    accountType,
    purpose,
    codeHash: hashOtpCode(otp),
    metadata,
    expiresAt,
  });

  return otp;
};

export const verifyOtp = async ({
  email,
  accountType,
  purpose,
  code,
  metadataMatcher = {},
}) => {
  const token = await OtpToken.findOne({
    email,
    accountType,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!token) {
    return false;
  }

  const matchesMetadata = Object.entries(metadataMatcher).every(
    ([key, value]) => token.metadata?.[key] === value,
  );

  if (!matchesMetadata || token.codeHash !== hashOtpCode(code)) {
    return false;
  }

  token.consumedAt = new Date();
  await token.save();

  return true;
};
