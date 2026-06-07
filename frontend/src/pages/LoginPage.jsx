import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, BarChart2, Shield, Clock, CheckCircle2 } from 'lucide-react';

const highlights = [
  { icon: BarChart2, text: 'Laporan energi otomatis' },
  { icon: Shield,    text: 'Keamanan data berlapis' },
  { icon: Clock,     text: 'Jadwal penggunaan pintar' },
];

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const location              = useLocation();
  const justRegistered        = location.state?.registered === true;

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
    <AuthShell
      title="Masuk ke akun"
      description="Belum punya akun?"
      descriptionLink="/register"
      descriptionLinkText="Daftar sekarang"
      asideTitle="Selamat Datang Kembali!"
      asideSubtitle="Masuk ke PlanDaya dan mulai kelola konsumsi listrik Anda lebih efisien."
      asideHighlights={highlights}
    >
      {justRegistered && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 animate-slide-down bg-success/10 border border-success/20">
          <CheckCircle2 size={16} className="text-success shrink-0" />
          <p className="text-sm text-success">
            Akun berhasil dibuat! Silakan masuk dengan akun Anda.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 animate-slide-down bg-danger/10 border border-danger/20">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="label-field">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="login-email"
              type="email"
              className="input-field pl-10"
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
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className="input-field pl-10 pr-11"
              placeholder="Masukkan password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-subtle text-text-placeholder"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" id="btn-login" className="btn-primary w-full py-3 mt-2" disabled={loading}>
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0 border-white/30 border-t-white" />
              Memverifikasi...
            </>
          ) : 'Masuk'}
        </button>
      </form>
    </AuthShell>
  );
}
