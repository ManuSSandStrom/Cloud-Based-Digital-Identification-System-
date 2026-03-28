import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

const loadImageBuffer = async (url) => {
  if (!url) {
    return null;
  }

  if (url.startsWith('data:image')) {
    return Buffer.from(url.split(',')[1], 'base64');
  }

  if (url.startsWith('/uploads/')) {
    const localPath = path.join(backendRoot, url);
    return fs.readFile(localPath);
  }

  if (url.startsWith('http')) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  return null;
};

export const generateIdPdf = async (user) =>
  new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const qrBuffer = await loadImageBuffer(user.qrCodeDataUrl);
    const profileBuffer = await loadImageBuffer(user.profileImage?.url);

    doc.roundedRect(40, 40, 515, 260, 18).fillAndStroke('#0f172a', '#0f172a');
    doc.roundedRect(55, 55, 485, 230, 16).fill('#f8fafc');

    doc.fillColor('#0f172a').fontSize(24).text('Digital Identification Card', 80, 75);
    doc.fontSize(11).fillColor('#475569').text('Cloud-Based Identity Verification', 80, 107);

    if (profileBuffer) {
      doc.save();
      doc.roundedRect(80, 140, 100, 120, 10).clip();
      doc.image(profileBuffer, 80, 140, { width: 100, height: 120 });
      doc.restore();
    } else {
      doc.roundedRect(80, 140, 100, 120, 10).fill('#dbeafe');
      doc
        .fillColor('#1d4ed8')
        .fontSize(30)
        .text(user.name.slice(0, 1).toUpperCase(), 117, 185, { align: 'center' });
    }

    doc.fillColor('#0f172a').fontSize(16).text(user.name, 210, 145);
    doc.fontSize(12).fillColor('#334155').text(`Digital ID: ${user.uniqueID}`, 210, 170);
    doc.text(`Role: ${user.role}`, 210, 192);
    doc.text(`Date of Birth: ${user.dob || 'Not updated'}`, 210, 214);
    doc.text(`Address: ${user.address || 'Not updated'}`, 210, 236, {
      width: 180,
    });

    if (qrBuffer) {
      doc.roundedRect(425, 140, 90, 90, 10).fill('#ffffff');
      doc.image(qrBuffer, 430, 145, { width: 80, height: 80 });
      doc.fillColor('#0f172a');
    }

    doc.fontSize(10).fillColor('#64748b').text('Scan the QR code to verify the identity securely.', 330, 240, {
      width: 180,
      align: 'center',
    });

    doc.end();
  });
