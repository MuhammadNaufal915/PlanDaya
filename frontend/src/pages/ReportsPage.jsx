import { useState, useEffect } from 'react';
import { reports as repApi } from '../services/api';
import { BarChart2, Zap, TrendingUp, Award, RefreshCw } from 'lucide-react';

const tabs = [
  { key: 'daily',   label: 'Harian' },
  { key: 'weekly',  label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
];

export default function ReportsPage() {
  const [tab, setTab]       = useState('monthly');
  const [data, setData]     = useState(null);
  const [top, setTop]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([repApi[tab](), repApi.topDevices({ limit: 5 })])
      .then(([r, t]) => { setData(r.data); setTop(t.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const maxWatt = top.reduce((m, d) => Math.max(m, d.power_watt || 0), 1);

  return (
    <div className="page-shell">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="font-display font-bold text-xl text-text-primary">Laporan Energi</h2>
          <p className="text-sm mt-0.5 text-text-muted">Analisis konsumsi listrik perangkat Anda</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2.5">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-subtle border border-border-default">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? 'bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.10)]'
                : 'text-text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                label: 'Total Daya',
                value: `${data.total_watt}W`,
                sub: `${data.device_count} perangkat`,
                iconColor: '#E8A020',
                iconBg: 'rgba(232,160,32,0.10)',
                accent: '#E8A020',
              },
              {
                icon: TrendingUp,
                label: 'Konsumsi',
                value: `${data.total_kwh} kWh`,
                sub: `periode ${tabs.find(t => t.key === tab)?.label.toLowerCase()}`,
                iconColor: '#4A80C4',
                iconBg: 'rgba(74,128,196,0.10)',
                accent: '#4A80C4',
              },
              {
                icon: BarChart2,
                label: 'Estimasi Biaya',
                value: `Rp ${(data.estimated_cost ?? 0).toLocaleString('id-ID')}`,
                sub: data.currency,
                iconColor: '#9050C8',
                iconBg: 'rgba(144,80,200,0.10)',
                accent: '#9050C8',
              },
            ].map(({ icon: Icon, label, value, sub, iconColor, iconBg, accent }) => (
              <div
                    key={label}
                    className="stat-card"
                  >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                    <Icon size={16} style={{ color: iconColor }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">{label}</p>
                </div>
                <p className="font-display font-bold text-2xl mb-0.5 text-text-primary">{value}</p>
                <p className="text-xs text-text-placeholder">{sub}</p>
                <div className="mt-3 h-0.5 rounded-full opacity-40"
                  style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              </div>
            ))}
          </div>

          {/* Top devices */}
          {top.length > 0 && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10">
                  <Award size={16} className="text-warning" />
                </div>
                <h3 className="font-semibold text-sm text-text-primary">Perangkat Terboros</h3>
              </div>
              <div className="space-y-4">
                {top.map((dev, i) => (
                  <div key={dev.id} className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === 0
                          ? 'bg-warning/15 text-[#B8760A]'
                          : 'bg-base text-text-placeholder'
                      }`}
                    >
                      {i + 1}
                    </div>

                    {/* Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold truncate text-text-primary">{dev.name}</p>
                        <span className="text-xs font-bold ml-3 flex-shrink-0 px-2 py-0.5 rounded-lg bg-warning/10 text-[#B8760A]">
                          {dev.power_watt}W
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-subtle">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(dev.power_watt / maxWatt) * 100}%`,
                            background: i === 0
                              ? 'linear-gradient(90deg, #E8A020, #F5C842)'
                              : 'linear-gradient(90deg, #1C1C1E, #6E6E73)',
                          }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-xs text-text-placeholder">{dev.monthly_kwh} kWh/bln</span>
                        <span className="text-xs text-text-placeholder">
                          ≈ Rp {(dev.monthly_cost_idr ?? 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-base">
            <BarChart2 size={28} className="text-text-placeholder" />
          </div>
          <p className="font-semibold mb-1.5 text-text-secondary">Belum ada data laporan</p>
          <p className="text-sm text-text-placeholder">Tambah perangkat terlebih dahulu untuk melihat laporan.</p>
        </div>
      )}
    </div>
  );
}
