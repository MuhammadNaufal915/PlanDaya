import { useState, useEffect } from 'react';
import { admin as adminApi } from '../services/api';
import { ShieldAlert, Users, Activity, AlertTriangle, RefreshCw, Clock, Shield } from 'lucide-react';

function StatCard({ icon: Icon, label, value, iconColor = '#1C1C1E', iconBg = 'rgba(28,28,30,0.08)' }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1 bg-elevated border border-border-default shadow-card">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-text-placeholder">{label}</p>
      <p className="font-display font-bold text-2xl text-text-primary">{value ?? '—'}</p>
    </div>
  );
}

export default function AdminPage() {
  const [dashboard, setDash]   = useState(null);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers]      = useState([]);
  const [logs, setLogs]        = useState([]);
  const [events, setEvents]    = useState([]);

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
    { key: 'overview',  label: 'Overview' },
    { key: 'users',     label: 'Users' },
    { key: 'logs',      label: 'Activity Logs' },
    { key: 'security',  label: 'Security Events' },
  ];

  return (
    <div className="page-shell">

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple/10">
              <ShieldAlert size={17} className="text-purple" />
            </div>
            <h2 className="font-display font-bold text-xl text-text-primary">Admin Panel</h2>
          </div>
          <p className="text-sm text-text-muted">Monitoring keamanan dan manajemen sistem</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2.5">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl w-fit max-w-full bg-subtle border border-border-default">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => loadTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.10)]'
                : 'text-text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
            </div>
          ) : dashboard && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={dashboard.totals.users} />
                <StatCard icon={Activity} label="Total Devices" value={dashboard.totals.devices}
                  iconColor="#4A80C4" iconBg="rgba(74,128,196,0.10)" />
                <StatCard icon={AlertTriangle} label="Failed Logins" value={dashboard.totals.failed_logins}
                  iconColor="#D94F4F" iconBg="rgba(217,79,79,0.10)" />
                <StatCard icon={ShieldAlert} label="Security Events" value={dashboard.totals.security_events}
                  iconColor="#9050C8" iconBg="rgba(144,80,200,0.10)" />
              </div>

              {/* Recent security events */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple/10">
                    <Shield size={16} className="text-purple" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">Recent Security Events</h3>
                </div>
                {(dashboard.recent_security_events || []).length === 0 ? (
                  <p className="text-sm text-center py-6 text-text-placeholder">Tidak ada security event terbaru.</p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.recent_security_events.slice(0, 5).map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-purple/5 border border-purple/10"
                      >
                        <Clock size={13} className="mt-[2px] flex-shrink-0 text-purple" />
                        <div>
                          <p className="text-xs font-mono text-text-secondary">
                            {JSON.stringify(ev).slice(0, 100)}...
                          </p>
                          <p className="text-xs mt-0.5 text-text-placeholder">{ev.created_at}</p>
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
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F2] bg-base">
                  {['Nama', 'Email', 'Role', 'Status', 'Dibuat'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-text-placeholder"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-[#F0F0F2] ${i % 2 === 0 ? 'bg-elevated' : 'bg-[#FAFAFA]'}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-semibold text-text-primary">{u.name}</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-purple/10 text-[#6A38B0]'
                            : 'bg-[#1C1C1E]/10 text-text-secondary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-placeholder">{u.created_at}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-text-placeholder">
                      Tidak ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs tab */}
      {activeTab === 'logs' && (
        <div className="card p-5 sm:p-6">
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {logs.map((l, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-base border border-subtle"
              >
                <Activity size={13} className="mt-[2px] flex-shrink-0 text-[#1C1C1E]" />
                <div>
                  <span className="text-xs font-bold text-text-primary">{l.action}</span>
                  <span className="text-xs ml-2 text-text-placeholder">
                    user:{l.user_id} · {l.ip}
                  </span>
                  <p className="text-xs mt-0.5 text-text-placeholder">{l.created_at}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-sm text-center py-10 text-text-placeholder">Tidak ada log aktivitas.</p>
            )}
          </div>
        </div>
      )}

      {/* Security events tab */}
      {activeTab === 'security' && (
        <div className="card p-5 sm:p-6">
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {events.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-danger/5 border border-danger/10"
              >
                <AlertTriangle size={13} className="mt-[2px] flex-shrink-0 text-danger" />
                <div>
                  <p className="text-xs font-mono text-text-secondary">
                    {JSON.stringify(ev).slice(0, 120)}
                  </p>
                  <p className="text-xs mt-0.5 text-text-placeholder">{ev.created_at}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-center py-10 text-text-placeholder">Tidak ada security event.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
