import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const loginActivitySchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    loggedInAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'System Admin',
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

adminSchema.pre('save', async function adminPreSave(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, bcryptSaltRounds);
  }

  next();
});

adminSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
