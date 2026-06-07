import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];
  const ps = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #07061a 0%, #0f0e2e 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_rgba(16,185,129,0.5)] animate-float">
            <Zap size={32} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Bergabung dengan PlanDaya
          </h2>
          <p className="text-white/50 leading-relaxed">
            Daftar gratis dan mulai kelola penggunaan listrik Anda lebih efisien hari ini.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 lg:px-12 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">PlanDaya</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-1">Buat akun baru</h1>
          <p className="text-white/40 text-sm mb-8">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Masuk di sini</Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="label-field">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="reg-name" type="text" className="input-field pl-9"
                  placeholder="Nama Anda" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required minLength={2} />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="label-field">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="reg-email" type="email" className="input-field pl-9"
                  placeholder="nama@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="label-field">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="input-field pl-9 pr-10"
                  placeholder="Min. 8 karakter" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= ps ? strengthColor[ps] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-white/40">{strengthLabel[ps]}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="label-field">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="reg-confirm" type={showPass ? 'text' : 'password'} className="input-field pl-9 pr-10"
                  placeholder="Ulangi password" value={form.password_confirmation}
                  onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} required />
                {form.password_confirmation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.password_confirmation
                      ? <CheckCircle2 size={16} className="text-emerald-400" />
                      : <AlertCircle size={16} className="text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" id="btn-register" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mendaftarkan...</>
              ) : 'Buat Akun'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
