import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SessionGuard from './SessionGuard';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/devices':   'Perangkat Saya',
  '/schedules': 'Jadwal Penggunaan',
  '/reports':   'Laporan Energi',
  '/admin':     'Admin Panel',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? 'PlanDaya';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col lg:ml-64 transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="w-full max-w-[1100px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <SessionGuard timeoutMinutes={15} warningMinutes={2} />
    </div>
  );
}
