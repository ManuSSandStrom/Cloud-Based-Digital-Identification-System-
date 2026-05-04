import { useEffect, useState } from 'react';
import AnalyticsChart from '../components/charts/AnalyticsChart.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { adminService } from '../services/adminService.js';
import { formatDateTime } from '../utils/helpers.js';
import { useDispatch } from 'react-redux';
import { showToast } from '../features/ui/uiSlice.js';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyOrgId, setBusyOrgId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load admin dashboard.';
      setError(message);
      dispatch(showToast({ type: 'error', message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusUpdate = async (organizationId, status) => {
    setBusyOrgId(organizationId);
    try {
      const response = await adminService.updateOrganizationStatus({
        organizationId,
        status,
      });
      dispatch(showToast({ type: 'success', message: response.message }));
      await fetchDashboard();
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.response?.data?.message || 'Unable to update organization status.',
        }),
      );
    } finally {
      setBusyOrgId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading admin dashboard..." />;
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Users" value={dashboard.stats.totalUsers} accent="brand" />
        <StatCard label="Organizations" value={dashboard.stats.totalOrganizations} accent="blue" />
        <StatCard label="Verifications" value={dashboard.stats.totalVerifications} accent="amber" />
        <StatCard label="Pending Orgs" value={dashboard.stats.pendingOrganizations} accent="rose" />
        <StatCard label="Students" value={dashboard.stats.totalStudents} accent="brand" />
        <StatCard label="Faculty" value={dashboard.stats.totalFaculty} accent="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart
          title="User Registrations"
          data={dashboard.analytics.registrationSeries}
          dataKey="total"
          stroke="#11b387"
        />
        <AnalyticsChart
          title="Verification Trend"
          data={dashboard.analytics.verificationSeries}
          dataKey="total"
          stroke="#0ea5e9"
        />
      </div>

      <SectionCard title="Organization Approvals" subtitle="Review every organization before they can verify digital identities.">
        <div className="space-y-3">
          {dashboard.organizations.map((organization) => (
            <article
              key={organization._id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{organization.name}</h3>
                    <Badge
                      value={organization.status}
                      tone={
                        organization.status === 'approved'
                          ? 'success'
                          : organization.status === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {organization.email} - Created {formatDateTime(organization.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleStatusUpdate(organization._id, 'approved')}
                    disabled={busyOrgId === organization._id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleStatusUpdate(organization._id, 'rejected')}
                    disabled={busyOrgId === organization._id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Verifications" subtitle="Latest platform-wide verification activity.">
          <div className="space-y-3">
            {dashboard.recentVerifications.map((item) => (
              <article
                key={`${item._id}-${item.timestamp}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {item.userId?.name || 'User'} verified by {item.organizationId?.name || 'Organization'}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {formatDateTime(item.timestamp)} - {item.method}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="System Logs" subtitle="High-level operational events across users, organizations, and administrators.">
          <div className="space-y-3">
            {dashboard.recentLogs.map((item) => (
              <article
                key={item._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.action}</p>
                  <Badge value={item.actorType || 'system'} tone="neutral" />
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {formatDateTime(item.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
