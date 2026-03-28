import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/common/Button.jsx';
import InputField from '../components/common/InputField.jsx';
import Loader from '../components/common/Loader.jsx';
import { clearAuthError, loginUser } from '../features/auth/authSlice.js';
import { showToast } from '../features/ui/uiSlice.js';
import { getDashboardRoute } from '../utils/helpers.js';

const accountOptions = [
  { value: 'user', label: 'Student / Faculty' },
  { value: 'organization', label: 'Organization' },
  { value: 'admin', label: 'Admin' },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, token, accountType } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    email: '',
    password: '',
    accountType: 'user',
  });

  useEffect(() => {
    if (token && accountType) {
      navigate(location.state?.from?.pathname || getDashboardRoute(accountType), {
        replace: true,
      });
    }
  }, [token, accountType, navigate, location.state]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const resultAction = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(resultAction)) {
      dispatch(
        showToast({
          type: 'success',
          message: 'Login successful.',
        }),
      );
      navigate(getDashboardRoute(resultAction.payload.accountType));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_460px]">
        <div className="hidden rounded-[2rem] bg-gradient-to-br from-ink via-slate-900 to-brand-800 p-10 text-white shadow-2xl lg:block">
          <p className="text-xs uppercase tracking-[0.35em] text-brand-200">Trusted Access</p>
          <h1 className="mt-6 font-display text-5xl font-semibold">
            Secure login for every role in the identity platform.
          </h1>
          <p className="mt-5 max-w-xl text-slate-200">
            Role-based authentication, encrypted identity data, OTP password reset, login alerts,
            and verification-ready digital ID cards.
          </p>
        </div>

        <div className="page-section mx-auto w-full max-w-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-brand-700 dark:text-brand-300">
            Sign in
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Access your dashboard
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <InputField
              label="Account Type"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              as="select"
              options={accountOptions}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader label="Signing in..." /> : 'Login'}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Link to="/forgot-password" className="text-brand-700 hover:text-brand-800 dark:text-brand-300">
              Forgot password?
            </Link>
            <Link to="/register" className="text-slate-600 hover:text-slate-900 dark:text-slate-300">
              Need an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
