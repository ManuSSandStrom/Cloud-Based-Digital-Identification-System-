export default function Badge({ value, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {value}
    </span>
  );
}
