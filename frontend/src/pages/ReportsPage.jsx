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
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Laporan Energi</h2>
          <p className="text-white/40 text-sm mt-1">Analisis konsumsi listrik perangkat Anda</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-amber-400" />
                <p className="text-white/50 text-xs">Total Daya</p>
              </div>
              <p className="text-white text-2xl font-display font-bold">{data.total_watt}W</p>
              <p className="text-white/30 text-xs mt-1">{data.device_count} perangkat</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-blue-400" />
                <p className="text-white/50 text-xs">Konsumsi</p>
              </div>
              <p className="text-white text-2xl font-display font-bold">{data.total_kwh} kWh</p>
              <p className="text-white/30 text-xs mt-1">periode {tabs.find(t => t.key === tab)?.label.toLowerCase()}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={16} className="text-purple-400" />
                <p className="text-white/50 text-xs">Estimasi Biaya</p>
              </div>
              <p className="text-white text-2xl font-display font-bold">
                Rp {(data.estimated_cost ?? 0).toLocaleString('id-ID')}
              </p>
              <p className="text-white/30 text-xs mt-1">{data.currency}</p>
            </div>
          </div>

          {/* Top devices */}
          {top.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Award size={18} className="text-amber-400" />
                <h3 className="text-white font-semibold">Perangkat Terboros</h3>
              </div>
              <div className="space-y-4">
                {top.map((dev, i) => (
                  <div key={dev.id} className="flex items-center gap-4">
                    <span className="text-white/20 text-sm font-bold w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium truncate">{dev.name}</p>
                        <span className="text-amber-400 text-xs font-semibold ml-2">{dev.power_watt}W</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                          style={{ width: `${(dev.power_watt / maxWatt) * 100}%` }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-white/30 text-xs">{dev.monthly_kwh} kWh/bln</span>
                        <span className="text-white/30 text-xs">≈ Rp {(dev.monthly_cost_idr ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <BarChart2 size={48} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Tambah perangkat terlebih dahulu untuk melihat laporan.</p>
        </div>
      )}
    </div>
  );
}
