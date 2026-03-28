import Badge from './Badge.jsx';

export default function DigitalIdCard({ user }) {
  if (!user) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-slate-900 to-brand-800 p-6 text-white shadow-2xl">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-20" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-200">Digital Identification</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">{user.name}</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge value={user.role} tone="success" />
            <Badge value={user.uniqueID} tone="neutral" />
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <p>
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Date of Birth</span>
              {user.dob || 'Pending update'}
            </p>
            <p>
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Address</span>
              {user.address || 'Pending update'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/10 p-4 backdrop-blur-xl">
          {user.qrCodeDataUrl ? (
            <img src={user.qrCodeDataUrl} alt="QR code" className="h-32 w-32 rounded-2xl bg-white p-2" />
          ) : null}
          <p className="text-center text-xs text-slate-200">
            Scan this code from the organization portal to verify the identity.
          </p>
        </div>
      </div>
    </div>
  );
}
