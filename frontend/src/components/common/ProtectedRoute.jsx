import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardRoute } from '../../utils/helpers.js';

export default function ProtectedRoute({ allowedAccountTypes }) {
  const location = useLocation();
  const { token, accountType } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedAccountTypes && !allowedAccountTypes.includes(accountType)) {
    return <Navigate to={getDashboardRoute(accountType)} replace />;
  }

  return <Outlet />;
}
