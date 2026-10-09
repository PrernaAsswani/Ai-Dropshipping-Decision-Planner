import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  GitBranch,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import DecisionIntelLogo from '../components/DecisionIntelLogo';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Insights',
    description: 'Predict demand, trends, and profit potential with intelligent scoring.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliable Suppliers',
    description: 'Compare suppliers using risk, reliability, and performance signals.',
  },
  {
    icon: GitBranch,
    title: 'Smart Workflow',
    description: 'Turn decisions into clear execution plans for every product cycle.',
  },
];

const stats = [
  { value: '10K+', label: 'Products Analyzed' },
  { value: '500+', label: 'Suppliers Verified' },
  { value: '95%', label: 'Prediction Accuracy' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (email === 'admin@decisionintel.com' && password !== 'admin123') {
      setError('Invalid credentials. For demo, use admin123 as password.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      login({ email, name: email === 'admin@decisionintel.com' ? 'Admin User' : undefined });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f7ff] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_9%_90%,rgba(124,58,237,0.2),transparent_17rem),radial-gradient(circle_at_40%_18%,rgba(99,102,241,0.14),transparent_24rem),linear-gradient(90deg,#fafaff_0%,#f4f1ff_50%,#312e81_50%,#4338ca_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden rounded-l-[2rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_16rem),linear-gradient(135deg,rgba(139,92,246,0.72),rgba(79,70,229,0.94)_48%,rgba(67,56,202,1))] lg:block">
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(255,255,255,0.52)_1px,transparent_1px)] [background-size:18px_18px]" />
        <svg className="absolute inset-0 h-full w-full opacity-45" viewBox="0 0 720 900" fill="none" aria-hidden="true">
          <path d="M90 330C180 220 278 452 382 340C462 254 538 282 660 178" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M80 660C180 520 310 760 420 610C506 492 552 534 690 426" stroke="#C4B5FD" strokeOpacity="0.65" strokeWidth="3" />
          <path d="M95 355C210 426 326 290 448 375C522 426 584 390 660 330" stroke="#E0E7FF" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="8 10" />
          <circle cx="90" cy="330" r="5" fill="white" opacity="0.85" />
          <circle cx="245" cy="405" r="5" fill="white" opacity="0.85" />
          <circle cx="382" cy="340" r="5" fill="white" opacity="0.85" />
          <circle cx="520" cy="292" r="5" fill="white" opacity="0.85" />
          <circle cx="660" cy="178" r="5" fill="white" opacity="0.85" />
        </svg>
      </div>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[34%] top-12 hidden text-indigo-500/50 lg:block"
        aria-hidden="true"
      >
        <Sparkles className="h-9 w-9" />
      </motion.div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="hidden flex-col justify-between px-10 py-10 lg:flex xl:px-16"
        >
          <DecisionIntelLogo />

          <div className="max-w-xl">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-950">
              Smarter Decisions,
              <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Better Profits.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-600">
              Leverage AI-powered insights to find winning products, reliable suppliers, and optimized dropshipping workflows.
            </p>

            <div className="mt-9 space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 + index * 0.08, ease: 'easeOut' }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-indigo-600 shadow-[0_14px_34px_rgba(79,70,229,0.12)] backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-3 divide-x divide-indigo-100 rounded-3xl border border-white/80 bg-white/65 p-5 text-center shadow-[0_18px_60px_rgba(79,70,229,0.10)] backdrop-blur-xl">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4">
                <p className="text-2xl font-extrabold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-8 top-20 hidden w-48 rounded-3xl border border-white/25 bg-white/15 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl lg:block"
          >
            <p className="text-xs font-medium text-white/70">Sales Overview</p>
            <p className="mt-2 text-2xl font-extrabold">+24.5%</p>
            <div className="mt-4 flex h-14 items-end gap-1.5">
              {[28, 40, 34, 52, 44, 62].map((height) => (
                <span key={height} style={{ height }} className="w-full rounded-full bg-white/55" />
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-24 right-28 hidden w-44 rounded-3xl border border-white/25 bg-white/15 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/70">Profit Margin</p>
                <p className="text-xl font-extrabold">28.6%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[23%] top-[43%] hidden w-52 rounded-3xl border border-white/25 bg-white/15 p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/70">Top Product</p>
                <p className="text-sm font-bold">Wireless Earbuds</p>
                <p className="text-sm font-extrabold">+38.2%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.48, ease: 'easeOut' }}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
          >
            <div className="p-8 text-center sm:p-10">
              <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/25 ring-8 ring-indigo-100/80">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Welcome Back</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Sign in to access your dashboard</p>
            </div>

            <div className="px-8 pb-8 sm:px-10 sm:pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 shadow-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,0.06)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,0.06)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 font-bold text-white shadow-xl shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-600/35 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:pointer-events-none disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 text-center text-sm text-slate-500">
                Don't have an account? <Link to="/signup" className="font-bold text-indigo-600 transition-colors hover:text-indigo-700">Sign Up</Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
