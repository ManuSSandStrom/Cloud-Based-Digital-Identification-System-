import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Organization from '../models/Organization.js';

export const protect =
  (allowedAccountTypes = []) =>
    asyncHandler(async (req, _res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required.', 401);
      }

      const token = authHeader.split(' ')[1];

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          throw new AppError('Session expired. Please log in again.', 401);
        }
        throw new AppError('Invalid authentication token.', 401);
      }

      if (
        allowedAccountTypes.length &&
        !allowedAccountTypes.includes(payload.accountType)
      ) {
        throw new AppError('You are not authorized to access this resource.', 403);
      }

      req.auth = payload;
      next();
    });

export const ensureApprovedOrganization = asyncHandler(async (req, _res, next) => {
  const organization = await Organization.findById(req.auth.sub);

  if (!organization) {
    throw new AppError('Organization account not found.', 404);
  }

  if (organization.status !== 'approved') {
    throw new AppError('Organization approval is required to verify users.', 403);
  }

  req.organization = organization;
  next();
});
