import crypto from 'crypto';

const buildKey = () =>
  crypto
    .createHash('sha256')
    .update(process.env.FIELD_ENCRYPTION_KEY || 'local-development-key')
    .digest();

const isEncryptedPayload = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = JSON.parse(value);
    return Boolean(parsed.iv && parsed.tag && parsed.content);
  } catch {
    return false;
  }
};

export const encryptValue = (value) => {
  if (!value) {
    return value;
  }

  if (isEncryptedPayload(value)) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', buildKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);

  return JSON.stringify({
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    content: encrypted.toString('hex'),
  });
};

export const decryptValue = (value) => {
  if (!value) {
    return value;
  }

  if (!isEncryptedPayload(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      buildKey(),
      Buffer.from(parsed.iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(parsed.content, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    return value;
  }
};

export const hashOtpCode = (code) =>
  crypto.createHash('sha256').update(String(code)).digest('hex');
