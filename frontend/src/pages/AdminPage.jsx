import { useState, useEffect } from 'react';
import { admin as adminApi } from '../services/api';
import { ShieldAlert, Users, Activity, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'text-emerald-400', bg = 'bg-emerald-400/10' }) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-white text-2xl font-display font-bold">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [dashboard, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminApi.dashboard();
      setDash(d.data);
    } catch {}
    setLoading(false);
  };

  const loadTab = async (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) {
      const r = await adminApi.users().catch(() => ({ data: [] }));
      setUsers(r.data || []);
    } else if (tab === 'logs' && logs.length === 0) {
      const r = await adminApi.logs().catch(() => ({ data: [] }));
      setLogs(r.data || []);
    } else if (tab === 'security' && events.length === 0) {
      const r = await adminApi.securityEvents().catch(() => ({ data: [] }));
      setEvents(r.data || []);
    }
  };

  useEffect(() => { load(); }, []);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users',    label: 'Users' },
    { key: 'logs',     label: 'Activity Logs' },
    { key: 'security', label: 'Security Events' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={20} className="text-purple-400" />
            <h2 className="font-display font-bold text-xl text-white">Admin Panel</h2>
          </div>
          <p className="text-white/40 text-sm">Monitoring keamanan dan manajemen sistem</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => loadTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === t.key
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-white/40 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : dashboard && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={dashboard.totals.users} />
                <StatCard icon={Activity} label="Total Devices" value={dashboard.totals.devices} color="text-blue-400" bg="bg-blue-400/10" />
                <StatCard icon={AlertTriangle} label="Failed Logins" value={dashboard.totals.failed_logins} color="text-red-400" bg="bg-red-400/10" />
                <StatCard icon={ShieldAlert} label="Security Events" value={dashboard.totals.security_events} color="text-purple-400" bg="bg-purple-400/10" />
              </div>

              {/* Recent security events */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert size={16} className="text-purple-400" />
                  <h3 className="text-white font-semibold">Recent Security Events</h3>
                </div>
                {(dashboard.recent_security_events || []).length === 0 ? (
                  <p className="text-white/30 text-sm">No security events.</p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.recent_security_events.slice(0, 5).map((ev, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <Clock size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-white/70 text-xs font-mono">{JSON.stringify(ev).slice(0, 100)}...</p>
                          <p className="text-white/25 text-xs mt-0.5">{ev.created_at}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Nama', 'Email', 'Role', 'Status', 'Dibuat'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 text-white text-sm font-medium">{u.name}</td>
                  <td className="px-5 py-4 text-white/50 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs">{u.created_at}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/30 text-sm">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs tab */}
      {activeTab === 'logs' && (
        <div className="glass-card p-5">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <Activity size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-white/70 text-xs font-semibold">{l.action}</span>
                  <span className="text-white/30 text-xs ml-2">user:{l.user_id} · {l.ip}</span>
                  <p className="text-white/25 text-xs mt-0.5">{l.created_at}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-white/30 text-sm text-center py-8">Tidak ada log aktivitas.</p>}
          </div>
        </div>
      )}

      {/* Security events tab */}
      {activeTab === 'security' && (
        <div className="glass-card p-5">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-xs font-mono">{JSON.stringify(ev).slice(0, 120)}</p>
                  <p className="text-white/25 text-xs mt-0.5">{ev.created_at}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-white/30 text-sm text-center py-8">Tidak ada security event.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
