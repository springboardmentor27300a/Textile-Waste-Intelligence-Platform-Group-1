import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, BarChart3, Cpu, ShieldCheck, Recycle, Users } from 'lucide-react';

const STATS = [
  { value: '94%', label: 'Recyclability Rate' },
  { value: '12K+', label: 'Batches Tracked' },
  { value: '3.2T', label: 'CO₂ Saved (kg)' },
  { value: '4', label: 'User Roles Supported' },
];

const FEATURES = [
  {
    icon: Recycle,
    title: 'Waste Inventory',
    description:
      'Log and track every textile waste batch — fabric type, weight, source, condition, and status — all in one place.',
  },
  {
    icon: Cpu,
    title: 'AI Classification',
    description:
      'Upload a fabric image and get instant material identification, recyclability scoring, and recommended processing route.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Visual dashboards for sustainability KPIs, material recovery rates, and ESG metrics. Export to PDF or Excel.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description:
      'Separate, focused dashboards for Administrators, Manufacturers, Recyclers, and Sustainability Managers.',
  },
  {
    icon: Users,
    title: 'Multi-Organization',
    description:
      'Multiple companies and facilities can operate on the same platform with complete data isolation per user.',
  },
  {
    icon: Leaf,
    title: 'Sustainability Tracking',
    description:
      'Monitor CO₂ savings, water conservation, and waste diversion from landfill in real time.',
  },
];

const STEPS = [
  { step: '01', title: 'Register', desc: 'Create an account for your organization and select your role.' },
  { step: '02', title: 'Log Batches', desc: 'Add textile waste batches with all relevant details and optional images.' },
  { step: '03', title: 'Run AI Analysis', desc: 'Upload a fabric photo to classify material and get recycling recommendations.' },
  { step: '04', title: 'Track & Report', desc: 'Monitor sustainability metrics and download reports for your stakeholders.' },
];

const LandingPage = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };
    el.addEventListener('mousemove', handleMouseMove);
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#080e0a] text-white flex flex-col font-sans antialiased">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080e0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Textile Waste Intelligence</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-white/50 transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Get Started
            </Link>
            <Link
              to="/admin/login"
              className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-32 text-center"
        style={{
          background:
            'radial-gradient(ellipse at var(--mx, 50%) var(--my, 40%), rgba(16,185,129,0.12) 0%, transparent 60%), #080e0a',
        }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Platform
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Smarter textile waste.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Cleaner planet.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-white/50 leading-relaxed">
            Track every kilogram of textile waste from production to recycling.
            Classify materials with AI, monitor sustainability performance, and make
            data-driven decisions — all in one platform.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-24 grid grid-cols-2 gap-px rounded-2xl border border-white/5 bg-white/5 overflow-hidden md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-[#080e0a]/60 px-8 py-6 backdrop-blur">
              <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="border-t border-white/5 py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Features</p>
            <h2 className="text-4xl font-bold tracking-tight">Everything you need to close the loop</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              From batch logging to AI classification to sustainability reporting — one platform for the entire textile waste lifecycle.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-white/5 py-28 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Process</p>
            <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-white/50">Four simple steps to go from raw waste data to recycling insights.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <span className="text-4xl font-black text-white/5 leading-none select-none">{step}</span>
                <div>
                  <h4 className="mb-1.5 font-semibold text-white">{title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section id="about" className="border-t border-white/5 py-28 px-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Ready to reduce textile waste?
          </h2>
          <p className="text-white/50 leading-relaxed max-w-lg mx-auto">
            Register your organization today and start tracking, classifying, and recycling textile waste with AI assistance and real-time analytics.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/admin/login"
              className="rounded-xl border border-white/10 px-7 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-white/30 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500">
              <Leaf className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-white/60">Textile Waste Intelligence</span>
          </div>
          <p>© {new Date().getFullYear()} Textile Waste Intelligence Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="transition hover:text-white">Sign in</Link>
            <Link to="/register" className="transition hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
