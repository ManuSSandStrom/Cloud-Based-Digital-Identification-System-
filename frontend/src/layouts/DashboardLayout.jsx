import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  SunMedium,
} from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import { toggleTheme } from '../features/ui/uiSlice.js';

const navigationByRole = {
  user: [
    { to: '/dashboard/user', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/user/id', label: 'Digital ID', icon: CreditCard },
  ],
  organization: [{ to: '/dashboard/org', label: 'Verification Hub', icon: Building2 }],
  admin: [{ to: '/dashboard/admin', label: 'Admin Console', icon: ShieldCheck }],
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, accountType } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigation = navigationByRole[accountType] || [];

  return (
    <div className="dashboard-shell">
      <aside className="relative hidden overflow-hidden border-r border-white/20 bg-ink px-6 py-8 text-white lg:block">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:22px_22px] opacity-10" />
        <div className="relative flex h-full flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-200">Digital ID Cloud</p>
            <h1 className="mt-4 font-display text-3xl font-semibold">
              Secure identity, ready in every workflow.
            </h1>
          </div>

          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      isActive
                        ? 'bg-white text-ink shadow-lg'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed in as</p>
            <h2 className="mt-3 text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-slate-300">{user?.email}</p>
          </div>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/75 px-5 py-4 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Dashboard Workspace
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
