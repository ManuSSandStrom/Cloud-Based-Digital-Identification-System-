import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { encryptValue, decryptValue } from '../utils/crypto.js';
import { USER_ROLES } from '../utils/constants.js';

const uploadSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const loginActivitySchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    loggedInAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    uniqueID: {
      type: String,
      unique: true,
      index: true,
    },
    dob: {
      type: String,
      set: encryptValue,
      get: decryptValue,
      default: '',
    },
    address: {
      type: String,
      set: encryptValue,
      get: decryptValue,
      default: '',
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    documents: [uploadSchema],
    qrCodeDataUrl: String,
    idIssuedAt: Date,
    lastLoginAt: Date,
    loginActivities: [loginActivitySchema],
    isKycComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: { getters: true },
  },
);

userSchema.pre('save', async function userPreSave(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
