import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import InputField from '../components/common/InputField.jsx';
import { authService } from '../services/authService.js';
import { useDispatch } from 'react-redux';
import { showToast } from '../features/ui/uiSlice.js';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [stage, setStage] = useState('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    accountType: 'user',
    otp: '',
    newPassword: '',
  });

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword({
        email: form.email,
        accountType: form.accountType,
      });
      dispatch(showToast({ type: 'success', message: response.message }));
      setStage('reset');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.resetPassword(form);
      dispatch(showToast({ type: 'success', message: response.message }));
      setStage('done');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="page-section w-full max-w-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-brand-700 dark:text-brand-300">
          Account recovery
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Reset your password securely
        </h1>

        {stage !== 'done' ? (
          <form
            onSubmit={stage === 'request' ? handleRequestOtp : handleResetPassword}
            className="mt-8 space-y-5"
          >
            <InputField
              label="Account Type"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              as="select"
              options={[
                { value: 'user', label: 'Student / Faculty' },
                { value: 'organization', label: 'Organization' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />

            {stage === 'reset' ? (
              <>
                <InputField label="OTP" name="otp" value={form.otp} onChange={handleChange} required />
                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
              </>
            ) : null}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : stage === 'request' ? 'Send OTP' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="mt-8 rounded-3xl bg-brand-50 p-5 text-sm text-brand-900 dark:bg-brand-950 dark:text-brand-100">
            Your password has been reset. You can now log in with the new password.
          </div>
        )}

        <Link to="/login" className="mt-6 inline-flex text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300">
          Return to login
        </Link>
      </div>
    </div>
  );
}
