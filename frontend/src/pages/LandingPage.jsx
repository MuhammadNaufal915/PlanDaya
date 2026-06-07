import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart2, Clock, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Monitor Konsumsi',
    desc: 'Pantau konsumsi listrik perangkat Anda secara real-time dan terstruktur.',
    iconColor: '#E8A020',
    iconBg: 'rgba(232,160,32,0.12)',
  },
  {
    icon: Clock,
    title: 'Jadwal Otomatis',
    desc: 'Atur jadwal penggunaan perangkat agar listrik tidak terbuang sia-sia.',
    iconColor: '#1C1C1E',
    iconBg: 'rgba(28,28,30,0.08)',
  },
  {
    icon: BarChart2,
    title: 'Laporan Energi',
    desc: 'Analisis laporan harian, mingguan, dan bulanan penggunaan daya Anda.',
    iconColor: '#4A80C4',
    iconBg: 'rgba(74,128,196,0.12)',
  },
  {
    icon: Shield,
    title: 'Keamanan Data',
    desc: 'Sistem berlapis dengan enkripsi end-to-end dan logging keamanan penuh.',
    iconColor: '#9050C8',
    iconBg: 'rgba(144,80,200,0.12)',
  },
];

const benefits = [
  { text: 'Hemat tagihan listrik hingga 30%' },
  { text: 'Kontrol perangkat dari mana saja' },
  { text: 'Laporan energi otomatis setiap bulan' },
  { text: 'Sistem keamanan berlapis' },
];

const stats = [
  { value: '30%',  label: 'Hemat Listrik' },
  { value: '24/7', label: 'Monitoring' },
  { value: '100%', label: 'Data Aman' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/94 backdrop-blur-[16px] border-b border-[#E5E5EA] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 py-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.25)] flex-shrink-0">
              <Zap size={17} color="#fff" fill="#fff" />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-text-primary leading-[1.2]">
                PlanDaya
              </div>
              <div className="text-[10px] text-text-placeholder leading-none">Energy Planner</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
              Masuk
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20">
        {/* BG blobs */}
        <div 
          className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(28,28,30,0.04) 0%, transparent 70%)' }} 
        />

        <div className="max-w-[900px] mx-auto px-6 text-center">

          {/* Headline */}
          <h1
            className="animate-slide-up font-display font-extrabold text-text-primary mt-[100px] mb-5 tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              lineHeight: 1.12,
            }}
          >
            Kelola Energi,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#1C1C1E] to-[#6E6E73]">
              Lebih Cerdas.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in text-[1.0625rem] leading-[1.7] text-text-muted max-w-[560px] mx-auto mb-9">
            PlanDaya membantu Anda mengatur jadwal penggunaan perangkat elektronik agar konsumsi listrik lebih efisien, hemat, dan terkontrol.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="btn-primary px-7 py-3 text-[0.9375rem]"
            >
              Mulai Sekarang <ChevronRight size={17} />
            </Link>
            <Link
              to="/login"
              className="btn-secondary px-7 py-3 text-[0.9375rem]"
            >
              Sudah punya akun? Masuk <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-[14px] max-w-[460px] mx-auto mt-[52px]">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-elevated border border-[#E5E5EA] rounded-2xl py-5 px-3 text-center shadow-card transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
              >
                <p className="font-display font-extrabold text-[1.6rem] text-text-primary leading-none">
                  {value}
                </p>
                <p className="text-[11px] text-text-placeholder mt-1 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fitur" className="py-20">
        <div className="max-w-[1100px] my-[60px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#1C1C1E]/[0.07] border border-[#1C1C1E]/[0.12] mb-4 text-[11px] font-bold tracking-[0.08em] uppercase text-text-secondary">
              Fitur Platform
            </div>
            <h2
              className="font-display font-bold text-text-primary mb-3 tracking-[-0.01em]"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              }}
            >
              Fitur Unggulan
            </h2>
            <p className="text-[15px] text-text-muted max-w-[440px] mx-auto">
              Semua yang Anda butuhkan untuk mengelola dan menghemat konsumsi listrik.
            </p>
          </div>

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {features.map(({ icon: Icon, title, desc, iconColor, iconBg }) => (
              <div
                key={title}
                className="bg-elevated border border-[#E5E5EA] rounded-[18px] p-6 shadow-card transition-all duration-250 cursor-default hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: iconBg }}
                >
                  <Icon size={21} color={iconColor} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  {title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="tentang" className="pb-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div
            className="rounded-3xl relative overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
            style={{
              padding: 'clamp(36px, 6vw, 64px)',
              background: 'linear-gradient(135deg, #1C1C1E 0%, #2D2D30 60%, #111112 100%)',
            }}
          >
            {/* Decorative blobs */}
            <div 
              className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full translate-x-[40%] -translate-y-[40%] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} 
            />
            <div 
              className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full -translate-x-[40%] translate-y-[40%] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} 
            />

            <div
              className="relative grid items-center gap-12"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
            >
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/12 mb-5 text-[11px] font-bold tracking-[0.08em] uppercase text-white/75">
                  Kenapa PlanDaya?
                </div>
                <h2
                  className="font-display font-bold text-white leading-[1.2] mb-4 tracking-[-0.01em]"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
                >
                  Hemat Lebih,{' '}
                  <span className="text-white/55">Cerdas Lebih.</span>
                </h2>
                <p className="text-sm leading-[1.7] text-white/60 mb-8">
                  Dengan PlanDaya, Anda tidak hanya menghemat listrik, tetapi juga mendapatkan kontrol penuh dan wawasan mendalam untuk gaya hidup yang lebih berkelanjutan.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-[11px] rounded-xl bg-white text-[#1C1C1E] text-sm font-semibold no-underline shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.30)]"
                >
                  Coba Gratis Sekarang <ChevronRight size={16} />
                </Link>
              </div>

              {/* Right — Benefits list */}
              <ul className="list-none flex flex-col gap-3">
                {benefits.map(({ text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3.5 py-3.5 px-[18px] rounded-[14px] bg-white/7 border border-white/10"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/14 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} color="rgba(255,255,255,0.9)" />
                    </div>
                    <span className="text-sm font-medium text-white/85">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-elevated border-t border-[#E5E5EA]">
        <div className="max-w-[1100px] mx-auto py-7 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={13} color="#fff" fill="#fff" />
            </div>
            <span className="font-display font-bold text-sm text-text-primary">
              PlanDaya
            </span>
          </div>
          <p className="text-xs text-text-placeholder text-center">
            © 2026 PlanDaya · Hemat penggunaan listrik anda.
          </p>
          <div className="flex gap-5">
            {['Privasi', 'Keamanan'].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs text-text-placeholder no-underline"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
