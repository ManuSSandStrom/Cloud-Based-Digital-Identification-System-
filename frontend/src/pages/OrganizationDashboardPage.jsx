import { useCallback, useEffect, useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import InputField from '../components/common/InputField.jsx';
import Loader from '../components/common/Loader.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import StatCard from '../components/common/StatCard.jsx';
import QrScannerPanel from '../components/scanner/QrScannerPanel.jsx';
import { orgService } from '../services/orgService.js';
import { extractUniqueId, formatDateTime } from '../utils/helpers.js';
import { useDispatch } from 'react-redux';
import { showToast } from '../features/ui/uiSlice.js';

export default function OrganizationDashboardPage() {
  const dispatch = useDispatch();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueId, setUniqueId] = useState('');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orgService.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load organization dashboard.';
      setError(message);
      dispatch(showToast({ type: 'error', message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerifyByQr = useCallback(
    async (value = uniqueId) => {
      const normalizedId = extractUniqueId(value);
      if (!normalizedId) return;

      setBusy(true);
      try {
        const response = await orgService.verifyByQr(normalizedId);
        setResult(response.data);
        setUniqueId(normalizedId);
        dispatch(showToast({ type: 'success', message: response.message }));
        await fetchDashboard();
      } catch (err) {
        dispatch(
          showToast({
            type: 'error',
            message: err.response?.data?.message || 'Verification failed.',
          }),
        );
      } finally {
        setBusy(false);
      }
    },
    [uniqueId, dispatch],
  );

  const handleRequestOtp = async () => {
    setBusy(true);
    try {
      const response = await orgService.requestOtp(uniqueId);
      dispatch(showToast({ type: 'success', message: response.message }));
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.response?.data?.message || 'Unable to send OTP.',
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    setBusy(true);
    try {
      const response = await orgService.verifyByOtp({ uniqueID: uniqueId, otp });
      setResult(response.data);
      dispatch(showToast({ type: 'success', message: response.message }));
      await fetchDashboard();
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.response?.data?.message || 'OTP verification failed.',
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Loader label="Loading organization dashboard..." />;
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Unable to load dashboard
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error || 'An unexpected error occurred.'}
        </p>
        <Button onClick={fetchDashboard}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Status" value={dashboard.organization.status} accent="brand" />
        <StatCard label="Verifications" value={dashboard.stats.verificationCount} accent="blue" />
        <StatCard
          label="Last Login"
          value={dashboard.stats.lastLoginAt ? 'Tracked' : 'Pending'}
          hint={formatDateTime(dashboard.stats.lastLoginAt)}
          accent="amber"
        />
      </div>

      <SectionCard
        title="Organization Approval"
        subtitle="Only approved organizations can verify digital identities."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            value={dashboard.organization.status}
            tone={
              dashboard.organization.status === 'approved'
                ? 'success'
                : dashboard.organization.status === 'pending'
                  ? 'warning'
                  : 'danger'
            }
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {dashboard.organization.status === 'approved'
              ? 'Your account is approved and ready to verify digital IDs.'
              : 'Admin approval is required before verification can begin.'}
          </p>
        </div>
      </SectionCard>

      {dashboard.organization.status === 'approved' ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Scan QR Code"
            subtitle="Use the device camera to scan a user QR code and verify them instantly."
          >
            <QrScannerPanel onDetected={handleVerifyByQr} />
          </SectionCard>

          <SectionCard
            title="Manual Verification"
            subtitle="Verify by direct ID lookup or request an OTP for a stronger verification step."
          >
            <div className="space-y-4">
              <InputField
                label="Unique ID or Verification URL"
                name="uniqueId"
                value={uniqueId}
                onChange={(event) => setUniqueId(event.target.value)}
                placeholder="DID-2026-123456"
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleVerifyByQr() } disabled={busy}>
                  Verify By QR Endpoint
                </Button>
                <Button variant="secondary" onClick={handleRequestOtp} disabled={busy || !uniqueId}>
                  Send OTP
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <InputField
                  label="OTP"
                  name="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter verification OTP"
                />
                <div className="self-end">
                  <Button onClick={handleVerifyOtp} disabled={busy || !otp}>
                    Verify With OTP
                  </Button>
                </div>
              </div>

              {result ? (
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                      {result.name}
                    </h3>
                    <Badge value="Verified" tone="success" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Role: {result.role}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">ID: {result.uniqueID}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">DOB: {result.dob || 'N/A'}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Address: {result.address || 'N/A'}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      ) : null}

      <SectionCard title="Recent Verification Activity" subtitle="The latest successful verification events performed by your organization.">
        <div className="space-y-3">
          {dashboard.recentVerifications.length ? (
            dashboard.recentVerifications.map((item) => (
              <article
                key={`${item.userId?._id || 'user'}-${item.timestamp}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.userId?.name || 'User'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.userId?.uniqueID} - {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                  <Badge value={item.method} tone="neutral" />
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No verification activity yet.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
