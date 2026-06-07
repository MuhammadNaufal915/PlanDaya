import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart2, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Monitor Konsumsi',
    desc: 'Pantau konsumsi listrik perangkat Anda secara real-time dan terstruktur.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Clock,
    title: 'Jadwal Otomatis',
    desc: 'Atur jadwal penggunaan perangkat agar listrik tidak terbuang sia-sia.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: BarChart2,
    title: 'Laporan Energi',
    desc: 'Analisis laporan harian, mingguan, dan bulanan penggunaan daya Anda.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Shield,
    title: 'Keamanan Data',
    desc: 'Sistem berlapis dengan enkripsi end-to-end dan logging keamanan penuh.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

const benefits = [
  'Hemat tagihan listrik hingga 30%',
  'Kontrol perangkat dari mana saja',
  'Laporan energi otomatis setiap bulan',
  'Sistem keamanan berlapis',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #07061a 0%, #0f0e2e 50%, #07061a 100%)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.5)]">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">PlanDaya</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm px-4 py-2">Masuk</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Daftar Gratis</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 lg:px-16 pt-20 pb-28 text-center overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8">
          <Shield size={13} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Blue Team Security Project</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6 animate-slide-up">
          Plan Smarter,{' '}
          <span className="text-gradient">Save Energy Better.</span>
        </h1>

        <p className="text-white/60 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
          PlanDaya membantu pengguna mengatur jadwal penggunaan perangkat elektronik agar konsumsi listrik lebih efisien, hemat, dan terkontrol.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Mulai Sekarang
            <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">
            Sudah punya akun? Masuk
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: '30%', label: 'Hemat Listrik' },
            { value: '24/7', label: 'Monitoring' },
            { value: '100%', label: 'Data Aman' },
          ].map(stat => (
            <div key={stat.label} className="glass-card py-4 px-3 text-center">
              <p className="text-gradient text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Fitur Unggulan</h2>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            Semua yang Anda butuhkan untuk mengelola dan menghemat konsumsi listrik rumah atau kantor.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="glass-card p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-16">
        <div className="max-w-4xl mx-auto glass-card p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
          <div className="grid lg:grid-cols-2 gap-8 items-center relative">
            <div>
              <h2 className="font-display font-bold text-3xl text-white mb-4">
                Kenapa pilih <span className="text-gradient">PlanDaya?</span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-6">
                PlanDaya dirancang khusus untuk proyek Blue Team keamanan jaringan, memastikan setiap data terlindungi dan setiap akses tercatat.
              </p>
              <Link to="/register" className="btn-primary inline-flex">
                Coba Gratis <ChevronRight size={18} />
              </Link>
            </div>
            <ul className="space-y-4">
              {benefits.map(b => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 lg:px-16 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">PlanDaya</span>
        </div>
        <p className="text-white/30 text-sm">
          © 2025 PlanDaya — Blue Team Security Project · Keamanan Jaringan
        </p>
      </footer>
    </div>
  );
}
