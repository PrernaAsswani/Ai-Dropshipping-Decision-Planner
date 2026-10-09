import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileInput, BarChart3, PieChart, GitMerge, FileText, Menu, X, LogOut, Package, Truck, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import PageTransition from './PageTransition';
import RouteLoadingIndicator from './RouteLoadingIndicator';
import DecisionIntelLogo from './DecisionIntelLogo';
import { resetDemoData } from '../services/storage';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-100",
        isActive
          ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/80"
          : "text-slate-500 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-sm"
      )
    }
  >
    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
    {label}
  </NavLink>
);

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useData();
  const navigate = useNavigate();
  const displayName = user?.name || 'User Account';
  const displayEmail = user?.email || 'Signed in';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'US';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetDemoData = () => {
    if (window.confirm("Are you sure you want to reset all demo data? This will restore the original dataset for Products, Suppliers, and Workflows. Current authentication will not be affected.")) {
      resetDemoData();
      alert("Demo data has been reset successfully! The page will now reload.");
      window.location.reload();
    }
  };

  return (
    <div className="app-shell flex">
      <RouteLoadingIndicator />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/85 backdrop-blur-xl border-r border-white/70 fixed h-full z-10 shadow-[12px_0_40px_rgba(15,23,42,0.04)]">
        <div className="p-6 border-b border-slate-100/80">
          <h1 className="text-xl">
            <DecisionIntelLogo />
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/products" icon={Package} label="Products" />
          <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" />
          <SidebarItem to="/input" icon={FileInput} label="Input Analysis" />
          <SidebarItem to="/analysis" icon={BarChart3} label="Analysis Results" />
          <SidebarItem to="/charts" icon={PieChart} label="Charts" />
          <SidebarItem to="/workflow" icon={GitMerge} label="Workflow" />
          <SidebarItem to="/report" icon={FileText} label="Decision Report" />
        </nav>
        <div className="p-4 border-t border-slate-100/80 space-y-2">
          <button 
            onClick={handleResetDemoData}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-100"
          >
            <RefreshCcw className="w-5 h-5" />
            Reset Demo Data
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 mb-2 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <div className="flex items-center gap-3 px-2 pt-3 border-t border-slate-100">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-slate-900">{displayName}</p>
              <p className="truncate text-slate-500 text-xs">{user?.role || 'User'} / {displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/85 backdrop-blur-xl border-b border-white/70 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg">
          <DecisionIntelLogo />
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-colors">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-xl z-10 pt-16 px-4 pb-4 flex flex-col h-full">
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-slate-950">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{user?.role || 'User'} / {displayEmail}</p>
            </div>
          </div>
          <div className="space-y-1.5 overflow-y-auto">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/products" icon={Package} label="Products" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/input" icon={FileInput} label="Input Analysis" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/analysis" icon={BarChart3} label="Analysis Results" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/charts" icon={PieChart} label="Charts" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/workflow" icon={GitMerge} label="Workflow" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/report" icon={FileText} label="Decision Report" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
          
          <div className="mt-auto border-t border-slate-100 pt-4 space-y-2">
            <button 
              onClick={() => {
                handleResetDemoData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-amber-100"
            >
              <RefreshCcw className="w-5 h-5" />
              Reset Demo Data
            </button>
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-7xl mx-auto">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
