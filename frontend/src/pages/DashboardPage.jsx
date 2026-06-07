import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { devices as devApi, reports as repApi } from '../services/api';
import { Cpu, Zap, TrendingDown, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = 'text-emerald-400', bg = 'bg-emerald-400/10' }) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
        <p className="text-white text-2xl font-display font-bold">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [devList, setDevList] = useState([]);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([devApi.list(), repApi.monthly()])
      .then(([d, r]) => { setDevList(d.data || []); setMonthly(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeDevices = devList.filter(d => d.is_active).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">
            Selamat datang, {user?.name?.split(' ')[0] ?? 'User'} 👋
          </h2>
          <p className="text-white/40 text-sm mt-1">Ini ringkasan penggunaan energi Anda hari ini.</p>
        </div>
        <Link to="/devices" className="btn-primary text-sm px-4 py-2">
          + Tambah Perangkat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Cpu}        label="Total Perangkat"   value={loading ? '—' : devList.length}   sub="terdaftar" />
        <StatCard icon={Zap}        label="Perangkat Aktif"   value={loading ? '—' : activeDevices}    sub="sedang digunakan" color="text-amber-400" bg="bg-amber-400/10" />
        <StatCard icon={TrendingDown} label="Estimasi Bulanan" value={loading ? '—' : `${monthly?.total_kwh ?? 0} kWh`} sub="konsumsi listrik" color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard icon={Calendar}   label="Biaya Estimasi"    value={loading ? '—' : `Rp ${(monthly?.estimated_cost ?? 0).toLocaleString('id-ID')}`} sub="per bulan" color="text-purple-400" bg="bg-purple-400/10" />
      </div>

      {/* Quick overview */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent devices */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Perangkat Terbaru</h3>
            <Link to="/devices" className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />)}
            </div>
          ) : devList.length === 0 ? (
            <div className="text-center py-8">
              <Cpu size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Belum ada perangkat. <Link to="/devices" className="text-emerald-400">Tambah sekarang</Link></p>
            </div>
          ) : (
            <div className="space-y-2">
              {devList.slice(0, 5).map(dev => (
                <div key={dev.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${dev.is_active ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{dev.name}</p>
                      <p className="text-white/40 text-xs">{dev.category}</p>
                    </div>
                  </div>
                  <span className="text-amber-400 text-sm font-medium">{dev.power_watt}W</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Energy tip */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-white font-semibold">Tips Hemat Energi</h3>
          </div>
          <div className="flex-1 space-y-3">
            {[
              'Atur jadwal mati otomatis untuk perangkat saat tidak digunakan.',
              'Gunakan mode hemat daya pada perangkat elektronik.',
              'Monitor perangkat dengan daya tinggi (>500W) lebih sering.',
              'Matikan standby mode — bisa hemat 10% tagihan listrik.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-400/5 border border-amber-400/10">
                <span className="text-amber-400 text-xs font-bold mt-0.5">{String(i+1).padStart(2,'0')}</span>
                <p className="text-white/60 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
