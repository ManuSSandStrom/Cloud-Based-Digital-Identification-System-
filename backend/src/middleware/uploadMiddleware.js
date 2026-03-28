import multer from 'multer';
import AppError from '../utils/AppError.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Unsupported file type uploaded.', 400));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadIdentityFiles = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);
