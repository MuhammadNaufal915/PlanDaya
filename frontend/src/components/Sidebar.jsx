import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Cpu, Calendar, BarChart2,
  ShieldAlert, LogOut, Zap, X, ChevronRight, ArrowLeft,
  Users, Activity, Shield
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/devices',   icon: Cpu,             label: 'Perangkat' },
  { to: '/schedules', icon: Calendar,        label: 'Jadwal' },
  { to: '/reports',   icon: BarChart2,       label: 'Laporan' },
];

const adminItems = [
  { to: '/admin', tab: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin', tab: 'users',    icon: Users,           label: 'Daftar Pengguna' },
  { to: '/admin', tab: 'logs',     icon: Activity,        label: 'Log Aktivitas' },
  { to: '/admin', tab: 'security', icon: Shield,          label: 'Log Keamanan' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const queryParams = new URLSearchParams(search);
  const currentTab = queryParams.get('tab') || 'overview';
  const isAdminPage = pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavClass = (to, tabKey) => {
    const isActive = pathname === to && (tabKey ? currentTab === tabKey : true);
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-neutral-100 text-neutral-900'
        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
    }`;
  };


  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-elevated border-r border-border-default
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F2]">
          <NavLink to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div
              className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shrink-0"
              style={{
                boxShadow: '0 4px 10px rgba(0,0,0,0.22)',
              }}
            >
              <Zap size={17} color="#fff" fill="#fff" />
            </div>
            <div>
              <span className="font-display font-bold text-sm block text-text-primary leading-[1.2]">
                PlanDaya
              </span>
              <span className="text-[10px] text-text-placeholder leading-none">Energy Planner</span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-100 text-text-placeholder"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-[#F0F0F2]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-primary">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-text-primary">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs truncate text-text-placeholder">
                {user?.role === 'admin' ? '🛡 Administrator' : 'Pengguna'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {isAdminPage ? (
            <>
              <p className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-[0.08em] uppercase text-text-placeholder">
                Administrasi
              </p>
              {adminItems.map(({ to, tab, icon: Icon, label }) => (
                <NavLink 
                  key={tab} 
                  to={`${to}?tab=${tab}`} 
                  className={getNavClass(to, tab)} 
                  onClick={onClose}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={17} />
                  </div>
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <p className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-[0.08em] uppercase text-text-placeholder">
                Menu Utama
              </p>
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={(navProps) => getNavClass(to)} onClick={onClose}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={17} />
                  </div>
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                </NavLink>
              ))}

              {isAdmin() && (
                <>
                  <p className="px-3 pb-2 pt-5 text-[10px] font-bold tracking-[0.08em] uppercase text-text-placeholder">
                    Administrasi
                  </p>
                  <NavLink to="/admin?tab=overview" className={(navProps) => getNavClass('/admin', 'overview')} onClick={onClose}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShieldAlert size={17} />
                    </div>
                    <span className="flex-1">Admin Panel</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#F0F0F2]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group hover:bg-red-50 text-text-placeholder"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut size={17} className="group-hover:text-red-500 transition-colors" />
            </div>
            <span className="group-hover:text-red-600 transition-colors">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
