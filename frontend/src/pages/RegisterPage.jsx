import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/common/Button.jsx';
import InputField from '../components/common/InputField.jsx';
import Loader from '../components/common/Loader.jsx';
import { authService } from '../services/authService.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { showToast } from '../features/ui/uiSlice.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [orgForm, setOrgForm] = useState({
    name: '',
    email: '',
    password: '',
    contactPerson: '',
    phone: '',
    address: '',
  });

  const handleUserChange = (event) => {
    setUserForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleOrgChange = (event) => {
    setOrgForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'user') {
        const response = await authService.registerUser(userForm);
        dispatch(setCredentials(response.data));
        dispatch(showToast({ type: 'success', message: response.message }));
        navigate('/dashboard/user');
      } else {
        const response = await authService.registerOrganization(orgForm);
        dispatch(showToast({ type: 'success', message: response.message }));
        navigate('/login');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="page-section w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-700 dark:text-brand-300">
              Register
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
              Create a new digital identity workspace
            </h1>
          </div>

          <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setMode('user')}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                mode === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Student / Faculty
            </button>
            <button
              type="button"
              onClick={() => setMode('organization')}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                mode === 'organization'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Organization
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          {mode === 'user' ? (
            <>
              <InputField label="Full Name" name="name" value={userForm.name} onChange={handleUserChange} required />
              <InputField label="Email" name="email" type="email" value={userForm.email} onChange={handleUserChange} required />
              <InputField label="Password" name="password" type="password" value={userForm.password} onChange={handleUserChange} required />
              <InputField
                label="Role"
                name="role"
                value={userForm.role}
                onChange={handleUserChange}
                as="select"
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'faculty', label: 'Faculty' },
                ]}
              />
            </>
          ) : (
            <>
              <InputField label="Organization Name" name="name" value={orgForm.name} onChange={handleOrgChange} required />
              <InputField label="Email" name="email" type="email" value={orgForm.email} onChange={handleOrgChange} required />
              <InputField label="Password" name="password" type="password" value={orgForm.password} onChange={handleOrgChange} required />
              <InputField label="Contact Person" name="contactPerson" value={orgForm.contactPerson} onChange={handleOrgChange} />
              <InputField label="Phone" name="phone" value={orgForm.phone} onChange={handleOrgChange} />
              <div className="md:col-span-2">
                <InputField label="Address" name="address" value={orgForm.address} onChange={handleOrgChange} as="textarea" />
              </div>
            </>
          )}

          {error ? <p className="md:col-span-2 text-sm text-rose-600">{error}</p> : null}

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300">
              Already registered? Login
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader label="Creating account..." /> : mode === 'user' ? 'Create User Account' : 'Submit Organization Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
