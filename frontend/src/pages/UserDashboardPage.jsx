import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/common/Button.jsx';
import DigitalIdCard from '../components/common/DigitalIdCard.jsx';
import InputField from '../components/common/InputField.jsx';
import Loader from '../components/common/Loader.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { userService } from '../services/userService.js';
import { updateUser } from '../features/auth/authSlice.js';
import { showToast } from '../features/ui/uiSlice.js';
import { formatDateTime } from '../utils/helpers.js';

export default function UserDashboardPage() {
  const dispatch = useDispatch();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    dob: '',
    address: '',
    profileImage: null,
    documents: [],
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await userService.getDashboard();
      setDashboard(response.data);
      setForm((current) => ({
        ...current,
        name: response.data.profile.name || '',
        dob: response.data.profile.dob || '',
        address: response.data.profile.address || '',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? (name === 'documents' ? [...files] : files[0]) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('dob', form.dob);
      payload.append('address', form.address);

      if (form.profileImage) {
        payload.append('profileImage', form.profileImage);
      }

      form.documents.forEach((file) => {
        payload.append('documents', file);
      });

      const response = await userService.uploadDocuments(payload);
      dispatch(updateUser(response.data));
      dispatch(showToast({ type: 'success', message: response.message }));
      await fetchDashboard();
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: error.response?.data?.message || 'Unable to update profile.',
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading user dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={dashboard.stats.documentCount} accent="brand" />
        <StatCard label="Verifications" value={dashboard.stats.verificationCount} accent="blue" />
        <StatCard
          label="KYC Status"
          value={dashboard.stats.kycCompleted ? 'Complete' : 'Pending'}
          accent="amber"
        />
        <StatCard
          label="Last Login"
          value={dashboard.stats.lastLoginAt ? 'Tracked' : 'New'}
          hint={formatDateTime(dashboard.stats.lastLoginAt)}
          accent="rose"
        />
      </div>

      <SectionCard
        title="Digital ID Snapshot"
        subtitle="Your QR-enabled identity card is ready to be shared with approved verifiers."
        action={
          <Link to="/dashboard/user/id">
            <Button>Open full card</Button>
          </Link>
        }
      >
        <DigitalIdCard user={dashboard.profile} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="KYC and Profile"
          subtitle="Upload your profile image and supporting documents to complete your digital identity."
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} />
            <InputField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Address" name="address" value={form.address} onChange={handleChange} as="textarea" />
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile Photo</span>
              <input name="profileImage" type="file" accept="image/*" onChange={handleChange} className="input-base file:mr-4 file:rounded-full file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Documents</span>
              <input name="documents" type="file" multiple accept=".pdf,image/*" onChange={handleChange} className="input-base file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white dark:file:bg-slate-100 dark:file:text-slate-900" />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving changes...' : 'Save profile and upload files'}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Verification History" subtitle="A timeline of organizations that verified your digital identity.">
          <div className="space-y-4">
            {dashboard.verificationHistory.length ? (
              dashboard.verificationHistory.map((item) => (
                <article
                  key={`${item.organizationId?._id || 'org'}-${item.timestamp}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {item.organizationId?.name || 'Organization'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateTime(item.timestamp)}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                      {item.status}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No verification records yet.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
