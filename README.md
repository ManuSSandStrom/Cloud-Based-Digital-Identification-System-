# Cloud-Based Digital Identification System

Production-ready MERN application for secure digital identity creation, QR-based verification, organization approval workflows, analytics, OTP password reset, login tracking, and PDF digital ID downloads.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, Multer, Cloudinary/local uploads, QRCode, PDFKit
- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, Axios, React Router, Recharts, html5-qrcode

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    templates/
    utils/
frontend/
  src/
    app/
    components/
    features/
    layouts/
    pages/
    services/
    utils/
```

## Features

- User registration and login for students and faculty
- Organization registration with admin approval
- Default admin bootstrap from environment variables
- JWT authentication and role-based access control
- AES-based field encryption for DOB and address
- Password hashing with bcrypt
- Email workflows for registration, login alerts, OTP reset, and status updates
- Unique digital ID generation with QR code
- PDF digital ID card download
- Login activity tracking and system activity logs
- Verification by QR endpoint or ID plus OTP
- Admin analytics dashboard with charts
- Responsive UI with dark mode
- QR scanner support through device camera

## Environment Setup

Copy the example environment files and update the values:

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

Important backend variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `BCRYPT_SALT_ROUNDS`
- `FIELD_ENCRYPTION_KEY`
- `CLIENT_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`

Keep the real admin password only in Render or your private `backend/.env`. Do not commit live admin credentials to GitHub.

## Install

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Run Locally

In one command:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend runs on `http://localhost:5000`

Frontend runs on `http://localhost:5173`

## Default Admin

The backend creates a default admin on startup using:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Core API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### User

- `GET /api/user/dashboard`
- `GET /api/user/profile`
- `POST /api/user/upload-documents`
- `GET /api/user/download-id`
- `GET /api/user/verification-history`

### Organization

- `POST /api/org/register`
- `GET /api/org/dashboard`
- `GET /api/org/verify/:id`
- `POST /api/org/request-otp`
- `POST /api/org/verify-otp`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/organizations`
- `PUT /api/admin/approve-org`
- `GET /api/admin/logs`

## Deployment Notes

- Set `CLIENT_URL` to the deployed frontend URL.
- Point `VITE_API_URL` to the deployed backend `/api` base URL.
- For production uploads, configure Cloudinary credentials.
- Set strong values for `JWT_SECRET` and `FIELD_ENCRYPTION_KEY`.
- Use a managed MongoDB deployment such as MongoDB Atlas.
- Configure SMTP credentials for email alerts and OTP delivery.

## Render + Netlify Deployment

### Backend on Render

- The repo includes `render.yaml`
- Create a new Render Blueprint or Web Service from this repo
- Render service settings already expect:
  - `rootDir=backend`
  - `buildCommand=npm install`
  - `startCommand=npm run start`
  - `healthCheckPath=/api/health`
- Add these environment variables in Render:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `FIELD_ENCRYPTION_KEY`
  - `CLIENT_URL`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `EMAIL_FROM`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

### Frontend on Netlify

- The repo includes `netlify.toml`
- Create a new Netlify site from this repo
- Netlify will use:
  - `base=frontend`
  - `build command=npm run build`
  - `publish=frontend/dist`
- Add this environment variable in Netlify:
  - `VITE_API_URL=https://cloud-based-digital-identification-system.onrender.com/api`
- After Netlify gives you a deployed frontend URL, set that same URL as `CLIENT_URL` in Render

## Verification Notes

- QR codes point to the frontend verification route: `/verify/:uniqueId`
- An approved organization account is required to verify a user
- OTP verification emails the registered user before the organization completes the check

## Testing Status

- Backend JavaScript files were syntax-checked with `node --check`
- Dependency installation and full build execution still require `npm install` in `backend/`, `frontend/`, and the repo root
