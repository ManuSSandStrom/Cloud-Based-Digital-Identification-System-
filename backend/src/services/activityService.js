import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ actorId, actorType, action, ip, metadata = {} }) => {
  await ActivityLog.create({
    actorId,
    actorType,
    action,
    ip,
    metadata,
  });
};
