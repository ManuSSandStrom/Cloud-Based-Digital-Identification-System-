import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actorId: mongoose.Schema.Types.ObjectId,
    actorType: String,
    action: {
      type: String,
      required: true,
    },
    ip: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
