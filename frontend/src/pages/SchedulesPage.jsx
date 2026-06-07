import { useState, useEffect } from 'react';
import { schedules as schApi, devices as devApi } from '../services/api';
import { Calendar, Plus, Pencil, Trash2, Clock, X, AlertCircle } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: 'Sen', Tue: 'Sel', Wed: 'Rab', Thu: 'Kam', Fri: 'Jum', Sat: 'Sab', Sun: 'Min' };

function ScheduleModal({ schedule, devices, onClose, onSave }) {
  const [form, setForm] = useState(schedule || {
    device_id: '', label: '', start_time: '08:00', end_time: '17:00', days: ['Mon'], is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const toggleDay = (d) =>
    setForm(f => ({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.days.length === 0) { setError('Pilih minimal satu hari.'); return; }
    setLoading(true); setError('');
    try {
      schedule?.id ? await schApi.update(schedule.id, form) : await schApi.create(form);
      onSave();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan jadwal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[8px]">
      <div className="w-full sm:max-w-md animate-slide-up rounded-t-3xl sm:rounded-2xl p-6 bg-elevated shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              {schedule?.id ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>
            <p className="text-xs mt-0.5 text-text-muted">Atur waktu penggunaan perangkat</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-neutral-100 text-text-placeholder"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex gap-2.5 p-3.5 rounded-xl mb-4 bg-danger/10 border border-danger/20">
            <AlertCircle size={14} className="mt-[2px] flex-shrink-0 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Perangkat</label>
            <select className="input-field" value={form.device_id}
              onChange={e => setForm(f => ({ ...f, device_id: e.target.value }))} required>
              <option value="">Pilih perangkat</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label-field">Label Jadwal</label>
            <input className="input-field" value={form.label} required placeholder="cth: Jadwal Pagi"
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Mulai</label>
              <input type="time" className="input-field" value={form.start_time} required
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="label-field">Selesai</label>
              <input type="time" className="input-field" value={form.end_time} required
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label-field mb-2 block">Hari Aktif</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map(d => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    form.days.includes(d)
                      ? 'bg-[#1C1C1E] text-white shadow-[0_2px_6px_rgba(0,0,0,0.22)]'
                      : 'bg-base text-text-muted border border-border-default'
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading
                ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                : schedule?.id ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [devices, setDevices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([schApi.list(), devApi.list()])
      .then(([s, d]) => { setSchedules(s.data || []); setDevices(d.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try { await schApi.delete(id); load(); } catch {}
  };

  const getDeviceName = (id) => devices.find(d => d.id === id)?.name ?? '—';

  return (
    <div className="page-shell">
      {modal !== null && (
        <ScheduleModal
          schedule={modal === 'add' ? null : modal}
          devices={devices}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="font-display font-bold text-xl text-text-primary">Jadwal Penggunaan</h2>
          <p className="text-sm mt-0.5 text-text-muted">{schedules.length} jadwal terdaftar</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      ) : schedules.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-base">
            <Calendar size={28} className="text-text-placeholder" />
          </div>
          <p className="font-semibold mb-1.5 text-text-secondary">Belum ada jadwal</p>
          <p className="text-sm mb-5 text-text-placeholder">Buat jadwal penggunaan perangkat pertama Anda</p>
          <button onClick={() => setModal('add')} className="btn-primary text-sm px-6">
            <Plus size={16} /> Buat Jadwal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(sch => (
            <div
              key={sch.id}
              className="card card-hover flex items-center gap-4 p-4 group transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Time icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#1C1C1E]/10">
                <Clock size={20} className="text-[#1C1C1E]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate text-text-primary">{sch.label}</p>
                  {sch.is_active && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-success/10 text-success">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs mb-2 text-text-muted">
                  {getDeviceName(sch.device_id)}
                  <span className="mx-1.5">·</span>
                  <Clock size={10} className="inline mr-0.5" />
                  {sch.start_time} – {sch.end_time}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {DAYS.map(d => (
                    <span key={d} className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                      (sch.days || []).includes(d)
                        ? 'bg-[#1C1C1E]/10 text-[#1C1C1E]'
                        : 'text-[#D1D1D6]'
                    }`}>
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => setModal(sch)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-neutral-100 text-text-muted">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(sch.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-red-50 text-text-muted">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
