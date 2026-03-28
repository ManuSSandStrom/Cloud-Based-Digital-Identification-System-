import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { ORG_STATUSES } from '../utils/constants.js';

const loginActivitySchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    loggedInAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    contactPerson: String,
    phone: String,
    address: String,
    status: {
      type: String,
      enum: ORG_STATUSES,
      default: 'pending',
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    lastLoginAt: Date,
    loginActivities: [loginActivitySchema],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

organizationSchema.pre('save', async function organizationPreSave(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

organizationSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
