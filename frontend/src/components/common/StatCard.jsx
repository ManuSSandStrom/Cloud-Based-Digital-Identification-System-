export default function StatCard({ label, value, accent = 'brand', hint }) {
  const accents = {
    brand: 'from-brand-500/20 to-emerald-200/20 text-brand-700 dark:text-brand-200',
    blue: 'from-sky-500/20 to-cyan-200/20 text-sky-700 dark:text-sky-200',
    amber: 'from-amber-500/20 to-yellow-200/20 text-amber-700 dark:text-amber-200',
    rose: 'from-rose-500/20 to-pink-200/20 text-rose-700 dark:text-rose-200',
  };

  return (
    <div className="page-section p-5">
      <div
        className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${accents[accent]}`}
      >
        {label}
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
