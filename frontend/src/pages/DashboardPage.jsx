import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { devices as devApi, reports as repApi } from '../services/api';
import { Cpu, Zap, TrendingDown, Calendar, ArrowRight, Lightbulb, Plus, MapPin } from 'lucide-react';

const tips = [
  'Atur jadwal mati otomatis untuk perangkat saat tidak digunakan.',
  'Gunakan mode hemat daya pada perangkat elektronik.',
  'Monitor perangkat dengan daya tinggi (>500W) lebih sering.',
  'Matikan standby mode — bisa hemat 10% tagihan listrik.',
];

function StatCard({ icon: Icon, label, value, sub, iconColor = '#1C1C1E', iconBg = 'rgba(28,28,30,0.08)', accentColor = '#1C1C1E' }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1 group bg-elevated border border-border-default shadow-card">
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-1 uppercase tracking-wide text-text-placeholder">{label}</p>
          <p className="font-display font-bold text-2xl leading-none text-text-primary">{value}</p>
          {sub && <p className="text-xs mt-1 text-text-placeholder">{sub}</p>}
        </div>
      </div>
      <div className="mt-4 h-0.5 rounded-full opacity-20" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)` }} />
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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="page-shell">

      {/* Greeting banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #2D2D30 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
        }}
      >
        <div>
          <p className="text-sm font-medium mb-1 text-white/55">
            {getGreeting()},
          </p>
          <h2 className="font-display font-bold text-2xl text-white">
            {user?.name?.split(' ')[0] ?? 'User'} 
          </h2>
          <p className="text-sm mt-1 text-white/50">
            Ini ringkasan penggunaan energi Anda hari ini.
          </p>
        </div>
        <Link
          to="/devices"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0 bg-white/15 text-white border border-white/20"
        >
          <Plus size={16} /> Tambah Perangkat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Cpu} label="Total Perangkat" value={loading ? '—' : devList.length} sub="terdaftar" />
        <StatCard icon={Zap} label="Perangkat Aktif" value={loading ? '—' : activeDevices} sub="digunakan"
          iconColor="#E8A020" iconBg="rgba(232,160,32,0.10)" accentColor="#E8A020" />
        <StatCard icon={TrendingDown} label="Estimasi Bulanan" value={loading ? '—' : `${monthly?.total_kwh ?? 0} kWh`} sub="konsumsi"
          iconColor="#4A80C4" iconBg="rgba(74,128,196,0.10)" accentColor="#4A80C4" />
        <StatCard icon={Calendar} label="Biaya Estimasi" value={loading ? '—' : `Rp ${(monthly?.estimated_cost ?? 0).toLocaleString('id-ID')}`} sub="per bulan"
          iconColor="#9050C8" iconBg="rgba(144,80,200,0.10)" accentColor="#9050C8" />
      </div>

      {/* Quick overview */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent devices */}
        <div className="page-section">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1C1C1E]/10">
                <Cpu size={16} className="text-[#1C1C1E]" />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Perangkat Terbaru</h3>
            </div>
            <Link to="/devices" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1C1E]">
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
            </div>
          ) : devList.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-base">
                <Cpu size={24} className="text-text-placeholder" />
              </div>
              <p className="text-sm font-medium mb-1 text-text-secondary">Belum ada perangkat</p>
              <Link to="/devices" className="text-xs font-semibold text-[#1C1C1E]">+ Tambah sekarang</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {devList.slice(0, 5).map(dev => (
                <div key={dev.id} className="flex items-center justify-between p-3 rounded-xl bg-base">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dev.is_active ? 'bg-success shadow-[0_0_0_3px_rgba(48,168,77,0.18)]' : 'bg-border-strong'}`} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{dev.name}</p>
                      <p className="text-xs text-text-placeholder">{dev.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-warning/10 text-[#B8760A]">
                    {dev.power_watt}W
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Energy tips */}
        <div className="page-section">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10">
              <Lightbulb size={16} className="text-warning" />
            </div>
            <h3 className="font-semibold text-sm text-text-primary">Tips Hemat Energi</h3>
          </div>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  i % 2 === 0 
                    ? 'bg-base border-[#F0F0F2]' 
                    : 'bg-warning/5 border-warning/10'
                }`}
              >
                <span
                  className={`text-xs font-bold mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${
                    i % 2 === 0
                      ? 'bg-[#1C1C1E]/10 text-[#1C1C1E]'
                      : 'bg-warning/15 text-[#B8760A]'
                  }`}
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
