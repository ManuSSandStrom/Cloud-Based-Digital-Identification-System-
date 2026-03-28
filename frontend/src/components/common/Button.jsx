export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300 dark:disabled:bg-brand-800',
    secondary:
      'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    ghost:
      'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800',
    danger:
      'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
