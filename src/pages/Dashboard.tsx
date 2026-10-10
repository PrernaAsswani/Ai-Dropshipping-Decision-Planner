import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity as ActivityIcon, TrendingUp, ShieldCheck, Package, Clock, Network, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProducts, getSuppliers, getActivities, getWorkflows, calculateProfit, calculateSupplierScore, Activity } from '../services/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    highDemand: 0,
    avgMargin: 0,
    reliableSuppliers: 0,
    totalSuppliers: 0,
    activeWorkflows: 0,
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, suppliers, workflows, activitiesData] = await Promise.all([
        getProducts(),
        getSuppliers(),
        getWorkflows(),
        getActivities()
      ]);
      
      setActivities(activitiesData.slice(0, 5));

      let highDemandCount = 0;
      let totalMargin = 0;

      products.forEach(p => {
        if (p.salesVolume === 'High') highDemandCount++;
        totalMargin += calculateProfit(p).margin;
      });

      let reliableSuppliersCount = 0;
      suppliers.forEach(s => {
        if (calculateSupplierScore(s).reliability >= 85) reliableSuppliersCount++;
      });

      const activeWorkflowsCount = workflows.filter(w => w.status === 'In Progress').length;

      setStats({
        totalProducts: products.length,
        highDemand: highDemandCount,
        avgMargin: products.length ? (totalMargin / products.length) : 0,
        reliableSuppliers: reliableSuppliersCount,
        totalSuppliers: suppliers.length,
        activeWorkflows: activeWorkflowsCount,
      });
      setInitialLoadDone(true);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      // Determine if this is a 429
      const errorMsg = err.message || 'Failed to load dashboard data. Please check your connection or API status.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      tone: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    },
    {
      title: 'High Demand',
      value: stats.highDemand,
      icon: TrendingUp,
      tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    },
    {
      title: 'Avg Profit Margin',
      value: `${stats.avgMargin.toFixed(1)}%`,
      icon: ActivityIcon,
      tone: 'bg-blue-50 text-blue-600 ring-blue-100',
    },
    {
      title: 'Reliable Suppliers',
      value: `${stats.reliableSuppliers} / ${stats.totalSuppliers}`,
      icon: ShieldCheck,
      tone: 'bg-amber-50 text-amber-600 ring-amber-100',
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3730a3_0%,#4f46e5_46%,#7c3aed_100%)] p-7 text-white shadow-[0_24px_70px_rgba(79,70,229,0.28)] md:p-10"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Welcome to Decision Intelligence</h1>
          <p className="mb-7 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
            Analyze products, score suppliers, and generate data-driven decision reports with our advanced ML-powered system.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Manage Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/suppliers" 
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-800/40 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-800/60 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              View Suppliers
            </Link>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => fetchData()} 
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Retry
          </button>
        </div>
      )}

      {loading && !initialLoadDone ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                  className="surface-card p-6"
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${card.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</h3>
                </motion.div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
              className="md:col-span-2 surface-card p-6"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-slate-100" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center shrink-0 z-10 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No recent activity found.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4, ease: 'easeOut' }}
              className="surface-card p-6 bg-gradient-to-b from-white to-slate-50/50"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Workflow Status</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <span className="text-sm font-medium text-slate-600">Active Workflows</span>
                  <span className="font-bold text-indigo-600">{stats.activeWorkflows}</span>
                </div>
                
                <Link to="/workflow" className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                  Manage Workflows
                </Link>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
