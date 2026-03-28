export const registrationEmailTemplate = ({ name, uniqueID }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Welcome to the Digital Identification System</h2>
    <p>Hello ${name},</p>
    <p>Your account has been created successfully.</p>
    <p><strong>Digital ID:</strong> ${uniqueID}</p>
    <p>You can now log in, upload your documents, and download your digital ID card.</p>
  </div>
`;

export const loginAlertTemplate = ({ name, ip, loggedInAt }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Login Alert</h2>
    <p>Hello ${name},</p>
    <p>Your account was accessed on ${new Date(loggedInAt).toLocaleString()} from IP ${ip}.</p>
    <p>If this was not you, reset your password immediately.</p>
  </div>
`;

export const otpEmailTemplate = ({ name, otp, purpose }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>One-Time Password</h2>
    <p>Hello ${name},</p>
    <p>Your OTP for ${purpose} is:</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
    <p>This code expires in 10 minutes.</p>
  </div>
`;

export const idGeneratedTemplate = ({ name, uniqueID }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Your Digital ID Is Ready</h2>
    <p>Hello ${name},</p>
    <p>Your cloud-based digital ID has been generated successfully.</p>
    <p><strong>ID Number:</strong> ${uniqueID}</p>
    <p>You can download the card as a PDF anytime from your dashboard.</p>
  </div>
`;

export const organizationStatusTemplate = ({ name, status }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Organization Status Update</h2>
    <p>Hello ${name},</p>
    <p>Your organization account status is now <strong>${status}</strong>.</p>
    <p>${status === 'approved' ? 'You can now verify digital IDs on the platform.' : 'Please contact the admin team if you need more details.'}</p>
  </div>
`;
