import mongoose from 'mongoose';
import { ACCOUNT_TYPES, OTP_PURPOSES } from '../utils/constants.js';

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: Object.values(ACCOUNT_TYPES),
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSES),
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpToken = mongoose.model('OtpToken', otpTokenSchema);

export default OtpToken;
