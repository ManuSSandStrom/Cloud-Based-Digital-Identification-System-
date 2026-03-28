import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    method: {
      type: String,
      enum: ['qr', 'otp'],
      default: 'qr',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);

export default VerificationLog;
