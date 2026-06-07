import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPass, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

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
  const strengthColors = ['', '#D94F4F', '#E8A020', '#30A84D', '#1C1C1E'];
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
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun baru"
      description="Sudah punya akun?"
      descriptionLink="/login"
      descriptionLinkText="Masuk di sini"
      asideTitle="Bergabung dengan PlanDaya"
      asideSubtitle="Daftar gratis dan mulai kelola penggunaan listrik Anda lebih efisien hari ini."
      asideHighlights={[
        { icon: CheckCircle2, text: 'Hemat tagihan listrik hingga 30%' },
        { icon: CheckCircle2, text: 'Kontrol perangkat dari mana saja' },
        { icon: CheckCircle2, text: 'Laporan energi otomatis setiap bulan' },
        { icon: CheckCircle2, text: 'Sistem keamanan berlapis' },
      ]}
    >
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 animate-slide-down bg-danger/10 border border-danger/20">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="label-field">Nama Lengkap</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="reg-name"
              type="text"
              className="input-field pl-10"
              placeholder="Nama Anda"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              minLength={2}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="label-field">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="reg-email"
              type="email"
              className="input-field pl-10"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="label-field">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              className="input-field pl-10 pr-11"
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-subtle text-text-placeholder"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {form.password && (
            <div className="mt-2.5">
              <div className="flex gap-1 mb-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= ps ? strengthColors[ps] : '#E0E0E5' }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: ps > 0 ? strengthColors[ps] : 'var(--color-text-placeholder)' }}>
                {strengthLabel[ps]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className="label-field">Konfirmasi Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              id="reg-confirm"
              type={showPass ? 'text' : 'password'}
              className="input-field pl-10 pr-11"
              placeholder="Ulangi password"
              value={form.password_confirmation}
              onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </AuthShell>
  );
}
