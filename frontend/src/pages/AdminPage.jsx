import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { admin as adminApi } from '../services/api';
import { ShieldAlert, Users, Activity, AlertTriangle, RefreshCw, Clock, Shield, BarChart3, Info } from 'lucide-react';

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
  const [searchParams]         = useSearchParams();
  const activeTab              = searchParams.get('tab') || 'overview';
  
  const [users, setUsers]      = useState([]);
  const [logs, setLogs]        = useState([]);
  const [events, setEvents]    = useState([]);
  
  // Interactive Hover States
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [hoveredSecurityTrend, setHoveredSecurityTrend] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminApi.dashboard();
      setDash(d.data);
    } catch {}
    setLoading(false);
  };

  const loadTab = async (tab) => {
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

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  // ─── Data calculations for Security Traffic (7 Days) ─────────────────────────
  const getSecurityTraffic = () => {
    const dates = [];
    const counts = {};
    
    // Generate last 7 days starting from today backwards
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dates.push({ dateString, label });
      counts[dateString] = 0;
    }

    // Count security events per day
    events.forEach(ev => {
      if (!ev.created_at) return;
      const datePart = ev.created_at.split(' ')[0];
      if (counts[datePart] !== undefined) {
        counts[datePart]++;
      }
    });

    return dates.map((d, idx) => ({
      label: d.label,
      count: counts[d.dateString],
      idx
    }));
  };

  const securityTrafficData = getSecurityTraffic();
  const maxSecurityVal = Math.max(...securityTrafficData.map(d => d.count), 1);

  // SVG coordinates for Security Traffic Chart (viewBox="0 0 500 150")
  const securityPoints = securityTrafficData.map((d) => {
    const x = 45 + d.idx * (415 / 6);
    const y = 120 - (d.count / maxSecurityVal) * 90; // Y range 30 to 120
    return { x, y, ...d };
  });

  const securityLinePath = securityPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const securityAreaPath = securityPoints.length > 0 ? `${securityLinePath} L 460 120 L 45 120 Z` : '';

  // ─── Data calculations for System Metric Overview (Bar Chart) ────────────────
  const getOverviewMetrics = () => {
    if (!dashboard) return [];
    const totals = dashboard.totals;
    return [
      { key: 'users', label: 'Users', value: totals.users, color: '#3B82F6', desc: 'Pengguna terdaftar' },
      { key: 'devices', label: 'Devices', value: totals.devices, color: '#10B981', desc: 'Perangkat pintar' },
      { key: 'failed_logins', label: 'Gagal Login', value: totals.failed_logins, color: '#EF4444', desc: 'Login tidak sah' },
      { key: 'security_events', label: 'Ancaman', value: totals.security_events, color: '#8B5CF6', desc: 'Insiden keamanan' },
    ];
  };

  const metricsData = getOverviewMetrics();
  const maxMetricVal = Math.max(...metricsData.map(d => d.value), 1);

  return (
    <div className="page-shell space-y-6">

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple/10">
              <ShieldAlert size={17} className="text-purple" />
            </div>
            <h2 className="font-display font-bold text-xl text-text-primary">Admin Panel</h2>
          </div>
          <p className="text-sm text-text-muted">Monitoring keamanan dan manajemen sistem secara real-time</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2.5">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
            </div>
          ) : dashboard && (
            <>
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={dashboard.totals.users} />
                <StatCard icon={Activity} label="Total Devices" value={dashboard.totals.devices}
                  iconColor="#4A80C4" iconBg="rgba(74,128,196,0.10)" />
                <StatCard icon={AlertTriangle} label="Failed Logins" value={dashboard.totals.failed_logins}
                  iconColor="#D94F4F" iconBg="rgba(217,79,79,0.10)" />
                <StatCard icon={ShieldAlert} label="Security Events" value={dashboard.totals.security_events}
                  iconColor="#9050C8" iconBg="rgba(144,80,200,0.10)" />
              </div>

              {/* Visualization Grid */}
              <div className="grid lg:grid-cols-3 gap-5">
                
                {/* System Metrics Bar Chart (takes 2 columns) */}
                <div className="lg:col-span-2 card p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md border border-border-default bg-elevated rounded-2xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10">
                        <BarChart3 size={16} className="text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-sm text-text-primary">Perbandingan Metrik Sistem</h3>
                    </div>
                    <p className="text-xs text-text-placeholder mb-4">Grafik visualisasi data keseluruhan pengguna, perangkat pintar, dan status keamanan.</p>
                  </div>

                  <div className="relative flex-1 min-h-[180px] w-full flex items-center justify-center">
                    <svg viewBox="0 0 400 180" width="100%" height="100%" className="overflow-visible select-none">
                      {/* Grid background lines */}
                      {[0, 0.25, 0.5, 0.75, 1.0].map((p, idx) => {
                        const y = 140 - p * 110;
                        const val = Math.round(p * maxMetricVal);
                        return (
                          <g key={idx} className="opacity-30">
                            <line x1="30" y1={y} x2="380" y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                            <text x="22" y={y + 3.5} fill="#9CA3AF" fontSize="9" fontWeight="600" textAnchor="end">{val}</text>
                          </g>
                        );
                      })}

                      {/* Bars */}
                      {metricsData.map((m, idx) => {
                        const x = 45 + idx * 85;
                        const barHeight = (m.value / maxMetricVal) * 110;
                        const y = 140 - barHeight;
                        const isHovered = hoveredMetric?.key === m.key;

                        return (
                          <g 
                            key={m.key}
                            onMouseEnter={() => setHoveredMetric(m)}
                            onMouseLeave={() => setHoveredMetric(null)}
                            className="cursor-pointer"
                          >
                            {/* Bar Background fill */}
                            <rect 
                              x={x} 
                              y="30" 
                              width="42" 
                              height="110" 
                              fill="#FAFAFA" 
                              rx="6" 
                              className="opacity-40" 
                            />
                            
                            {/* Bar Colored representation */}
                            <rect 
                              x={x} 
                              y={y} 
                              width="42" 
                              height={Math.max(barHeight, 4)} 
                              fill={m.color} 
                              rx="6" 
                              className="transition-all duration-300"
                              opacity={isHovered ? 0.9 : 0.7}
                            />
                            
                            {/* Value label */}
                            <text 
                              x={x + 21} 
                              y={y - 6} 
                              fill={isHovered ? m.color : "#1C1C1E"} 
                              fontSize="11" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {m.value}
                            </text>

                            {/* X Label */}
                            <text 
                              x={x + 21} 
                              y="156" 
                              fill="#6B7280" 
                              fontSize="9.5" 
                              fontWeight="600" 
                              textAnchor="middle"
                            >
                              {m.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Metric Details Panel (Inside card, dynamic) */}
                    <div className="absolute top-0 right-0 max-w-[150px] bg-base p-2.5 rounded-xl border border-border-default text-left hidden md:block">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Info size={11} className="text-text-placeholder" />
                        <span className="text-[10px] font-bold text-text-placeholder uppercase">Detail Metrik</span>
                      </div>
                      {hoveredMetric ? (
                        <div>
                          <p className="text-xs font-bold" style={{ color: hoveredMetric.color }}>{hoveredMetric.label}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{hoveredMetric.desc}</p>
                          <p className="text-sm font-black text-text-primary mt-1">{hoveredMetric.value}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-text-placeholder">Arahkan kursor ke diagram batang untuk melihat rincian sistem.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Security Events (takes 1 column) */}
                <div className="card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple/10">
                      <Shield size={16} className="text-purple" />
                    </div>
                    <h3 className="font-semibold text-sm text-text-primary">Recent Alerts</h3>
                  </div>
                  {(dashboard.recent_security_events || []).length === 0 ? (
                    <p className="text-sm text-center py-6 text-text-placeholder">Tidak ada security event terbaru.</p>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {dashboard.recent_security_events.slice(0, 4).map((ev, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-purple/5 border border-purple/10 text-[11px] leading-relaxed transition-all duration-150 hover:bg-purple/10/50"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono font-bold text-purple">{ev.event || 'SECURITY_EVENT'}</span>
                            <span className="text-[9px] text-text-placeholder">{ev.created_at ? ev.created_at.split(' ')[1] : ''}</span>
                          </div>
                          <p className="text-text-secondary truncate">{ev.message || JSON.stringify(ev)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                className="flex items-start gap-3 p-3.5 rounded-xl bg-base border border-subtle hover:bg-neutral-50 transition-colors"
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
        <div className="space-y-6">

          {/* Visualisasi Traffic Log Keamanan */}
          <div className="card p-5 sm:p-6 transition-all duration-200 hover:shadow-md border border-border-default bg-elevated rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10">
                  <ShieldAlert size={16} className="text-red-500" />
                </div>
                <h3 className="font-semibold text-sm text-text-primary">Traffic Deteksi Ancaman Keamanan</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                Security Traffic (7 Hari Terakhir)
              </span>
            </div>
            <p className="text-xs text-text-placeholder mb-4">Grafik ini memantau frekuensi alarm, aktivitas mencurigakan, dan percobaan login tidak sah.</p>

            {loading ? (
              <div className="h-44 skeleton rounded-xl w-full" />
            ) : events.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border-default rounded-xl bg-base p-6 text-center">
                <ShieldAlert size={28} className="text-text-placeholder mb-2" />
                <p className="text-sm font-semibold text-text-secondary">Tidak Ada Aktivitas Ancaman</p>
                <p className="text-xs text-text-placeholder max-w-xs mt-1">Sistem berada dalam kondisi aman. Tidak ada insiden keamanan yang terdeteksi.</p>
              </div>
            ) : (
              <div className="relative h-44 w-full">
                <svg viewBox="0 0 500 150" width="100%" height="100%" className="overflow-visible select-none">
                  <defs>
                    <linearGradient id="securityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 0.33, 0.66, 1.0].map((p, idx) => {
                    const val = Math.round(p * maxSecurityVal);
                    const y = 120 - p * 90;
                    return (
                      <g key={idx} className="opacity-30">
                        <line x1="45" y1={y} x2="460" y2={y} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="35" y={y + 3} fill="#9CA3AF" fontSize="9" fontWeight="600" textAnchor="end">{val} Incidents</text>
                      </g>
                    );
                  })}

                  {/* Red Area Fill */}
                  <path d={securityAreaPath} fill="url(#securityAreaGradient)" className="transition-all duration-300" />

                  {/* Red Line Path */}
                  <path d={securityLinePath} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />

                  {/* Interactive Points */}
                  {securityPoints.map((p) => {
                    const isHovered = hoveredSecurityTrend?.idx === p.idx;
                    return (
                      <g key={p.idx}>
                        {isHovered && (
                          <line x1={p.x} y1="30" x2={p.x} y2="120" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" className="opacity-55" />
                        )}
                        <circle cx={p.x} cy={p.y} r={isHovered ? 6.5 : 4.5} fill={isHovered ? "#EF4444" : "#FFFFFF"} stroke="#EF4444" strokeWidth="2.5" className="transition-all duration-200" />
                        
                        {/* Invisible hover trigger */}
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="18" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredSecurityTrend(p)}
                          onMouseLeave={() => setHoveredSecurityTrend(null)}
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Labels */}
                  {securityPoints.map((p) => (
                    <text key={p.idx} x={p.x} y="142" fill="#6B7280" fontSize="9" fontWeight="600" textAnchor="middle">
                      {p.label}
                    </text>
                  ))}

                  {/* Floating Red Tooltip */}
                  {hoveredSecurityTrend && (
                    <g transform={`translate(${Math.max(15, Math.min(500 - 125, hoveredSecurityTrend.x - 55))}, ${Math.max(10, hoveredSecurityTrend.y - 50)})`} className="transition-all duration-200 pointer-events-none">
                      <rect width="110" height="38" rx="8" fill="#1C1C1E" opacity="0.95" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" />
                      <text x="55" y="14" fill="#FCA5A5" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        {hoveredSecurityTrend.label}
                      </text>
                      <text x="55" y="28" fill="#FFFFFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                        {hoveredSecurityTrend.count} Insiden
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            )}
          </div>

          {/* List of Security Events Log */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-danger/10">
                <AlertTriangle size={16} className="text-danger" />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Logs Rincian Deteksi Ancaman</h3>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {events.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-danger/5 border border-danger/10 hover:bg-danger/10/40 transition-colors"
                >
                  <AlertTriangle size={13} className="mt-[2px] flex-shrink-0 text-danger" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold text-danger">{ev.event || 'SECURITY_ALERT'}</span>
                      <span className="text-[10px] text-text-placeholder">{ev.created_at}</span>
                    </div>
                    <p className="text-xs font-mono text-text-secondary leading-relaxed break-all">
                      {ev.message || JSON.stringify(ev)}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-center py-10 text-text-placeholder">Tidak ada security event.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
