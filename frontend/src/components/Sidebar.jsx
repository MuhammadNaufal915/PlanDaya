import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Cpu, Calendar, BarChart2,
  ShieldAlert, LogOut, Zap, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/devices',   icon: Cpu,             label: 'Perangkat' },
  { to: '/schedules', icon: Calendar,        label: 'Jadwal' },
  { to: '/reports',   icon: BarChart2,       label: 'Laporan' },
];

const adminItems = [
  { to: '/admin', icon: ShieldAlert, label: 'Admin Panel' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'text-white/60 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-navy-900 border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #0f0e2e 0%, #07061a 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.5)]">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">PlanDaya</span>
          </NavLink>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</p>
              <p className="text-white/40 text-xs truncate">{user?.role === 'admin' ? '🛡 Admin' : '👤 User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navClass} onClick={onClose}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="px-4 py-2 mt-4">
                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest">Admin</p>
              </div>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={navClass} onClick={onClose}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
