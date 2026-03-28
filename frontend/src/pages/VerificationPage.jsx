import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { orgService } from '../services/orgService.js';
import { showToast } from '../features/ui/uiSlice.js';

export default function VerificationPage() {
  const dispatch = useDispatch();
  const { uniqueId } = useParams();
  const { token, accountType } = useSelector((state) => state.auth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orgService.verifyByQr(uniqueId);
      setResult(response.data);
      dispatch(showToast({ type: 'success', message: response.message }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && accountType === 'organization') {
      handleVerify();
    }
  }, [token, accountType]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="page-section w-full max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-brand-700 dark:text-brand-300">
          Verification endpoint
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Verify digital ID: {uniqueId}
        </h1>

        {!token || accountType !== 'organization' ? (
          <div className="mt-8 rounded-3xl bg-amber-50 p-5 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            You need to sign in with an approved organization account to verify this identity.
            <div className="mt-4">
              <Link to="/login">
                <Button>Login as Organization</Button>
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8">
            <Loader label="Verifying identity..." />
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm text-rose-600">{error}</p> : null}

        {result ? (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                {result.name}
              </h2>
              <Badge value="Verified" tone="success" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Role
                </span>
                {result.role}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Unique ID
                </span>
                {result.uniqueID}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Date of Birth
                </span>
                {result.dob || 'Not provided'}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Address
                </span>
                {result.address || 'Not provided'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
