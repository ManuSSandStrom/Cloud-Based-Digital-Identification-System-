import QRCode from 'qrcode';
import User from '../models/User.js';

export const generateUniqueId = async () => {
  let uniqueId;
  let exists = true;

  while (exists) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    uniqueId = `DID-${new Date().getFullYear()}-${suffix}`;
    exists = await User.exists({ uniqueID: uniqueId });
  }

  return uniqueId;
};

export const buildVerificationUrl = (uniqueId) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl.replace(/\/$/, '')}/verify/${uniqueId}`;
};

export const generateUserQrCode = (uniqueId) =>
  QRCode.toDataURL(buildVerificationUrl(uniqueId), {
    width: 280,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
