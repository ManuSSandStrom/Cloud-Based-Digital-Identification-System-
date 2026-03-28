import { ArrowRight, Building2, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

const highlights = [
  {
    icon: CreditCard,
    title: 'Digital IDs with QR verification',
    description: 'Replace fragile physical cards with a secure, cloud-based identity card and downloadable PDF.',
  },
  {
    icon: Building2,
    title: 'Organization verification workflow',
    description: 'Approved organizations can verify identities using a QR scan or ID plus OTP flow.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin oversight and analytics',
    description: 'Monitor approvals, verifications, activity logs, and platform growth from a single control center.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-20" />
      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-700 dark:text-brand-300">
              Digital ID Cloud
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">
              Identity verification built for campuses, hospitals, and secure teams.
            </h1>
          </div>

          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-ink via-slate-900 to-brand-800 p-8 text-white shadow-2xl">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-brand-100">
              Cloud-based digital identification
            </p>
            <h2 className="mt-6 max-w-2xl font-display text-4xl font-semibold">
              Issue trusted digital identity cards, secure every login, and verify people in seconds.
            </h2>
            <p className="mt-5 max-w-2xl text-slate-200">
              Built with the MERN stack, QR verification, OTP workflows, PDF cards, analytics, activity logs,
              and role-based dashboards for users, organizations, and administrators.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="bg-white text-ink hover:bg-slate-100">
                  Create account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/verify/DID-2026-DEMO">
                <Button variant="ghost" className="border border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Open verification flow
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="page-section flex items-center gap-4">
              <div className="rounded-2xl bg-brand-100 p-3 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">User dashboard</p>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                  KYC uploads, verification history, and downloadable digital ID.
                </h3>
              </div>
            </div>

            <div className="page-section grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
                    <div className="inline-flex rounded-2xl bg-white p-3 text-brand-600 shadow-sm dark:bg-slate-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
