import Admin from '../models/Admin.js';

export const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  await Admin.create({
    name: process.env.ADMIN_NAME || 'System Admin',
    email: adminEmail,
    password: adminPassword,
  });

  console.log(`Default admin created for ${adminEmail}`);
};
