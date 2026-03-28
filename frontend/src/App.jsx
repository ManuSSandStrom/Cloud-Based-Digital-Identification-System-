import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Loader from './components/common/Loader.jsx';
import Toast from './components/common/Toast.jsx';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage.jsx'));
const DigitalIdPage = lazy(() => import('./pages/DigitalIdPage.jsx'));
const OrganizationDashboardPage = lazy(() => import('./pages/OrganizationDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const VerificationPage = lazy(() => import('./pages/VerificationPage.jsx'));

export default function App() {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader label="Loading workspace..." />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify/:uniqueId" element={<VerificationPage />} />

          <Route element={<ProtectedRoute allowedAccountTypes={['user', 'organization', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedAccountTypes={['user']} />}>
                <Route path="user" element={<UserDashboardPage />} />
                <Route path="user/id" element={<DigitalIdPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedAccountTypes={['organization']} />}>
                <Route path="org" element={<OrganizationDashboardPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedAccountTypes={['admin']} />}>
                <Route path="admin" element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toast />
    </BrowserRouter>
  );
}
