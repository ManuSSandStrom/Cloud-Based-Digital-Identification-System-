import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, '../../uploads');

const buildDataUri = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

export const uploadFile = async (file, folder = 'general') => {
  if (!file) {
    return null;
  }

  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(buildDataUri(file), {
      folder: `digital-id/${folder}`,
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  const folderPath = path.join(uploadsRoot, folder);
  await fs.mkdir(folderPath, { recursive: true });

  const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;
  const fullPath = path.join(folderPath, safeName);
  await fs.writeFile(fullPath, file.buffer);

  return {
    url: `/uploads/${folder}/${safeName}`,
    publicId: safeName,
  };
};
