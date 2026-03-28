import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '../../features/ui/uiSlice.js';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => {
      dispatch(clearToast());
    }, 3500);

    return () => clearTimeout(timeout);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-white/60 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:border-slate-700">
      <p className="font-semibold capitalize">{toast.type || 'info'}</p>
      <p className="mt-1 text-slate-200">{toast.message}</p>
    </div>
  );
}
