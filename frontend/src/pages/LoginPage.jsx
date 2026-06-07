import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #07061a 0%, #0f0e2e 100%)' }}>
      {/* Left panel — branding */}
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
            Selamat datang kembali!
          </h2>
          <p className="text-white/50 leading-relaxed">
            Masuk ke PlanDaya dan mulai kelola konsumsi listrik Anda secara cerdas.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">PlanDaya</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-1">Masuk ke akun</h1>
          <p className="text-white/40 text-sm mb-8">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Daftar sekarang</Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="label-field">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-9"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="label-field">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-9 pr-10"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" id="btn-login" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memverifikasi...</>
              ) : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
