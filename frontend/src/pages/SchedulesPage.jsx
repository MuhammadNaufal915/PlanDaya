import { useState, useEffect } from 'react';
import { schedules as schApi, devices as devApi } from '../services/api';
import { Calendar, Plus, Pencil, Trash2, Clock, X, AlertCircle } from 'lucide-react';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_LABELS = { Mon:'Sen', Tue:'Sel', Wed:'Rab', Thu:'Kam', Fri:'Jum', Sat:'Sab', Sun:'Min' };

function ScheduleModal({ schedule, devices, onClose, onSave }) {
  const [form, setForm] = useState(schedule || {
    device_id: '', label: '', start_time: '08:00', end_time: '17:00', days: ['Mon'], is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.days.length === 0) { setError('Pilih minimal satu hari.'); return; }
    setLoading(true); setError('');
    try {
      if (schedule?.id) { await schApi.update(schedule.id, form); }
      else              { await schApi.create(form); }
      onSave();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan jadwal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">{schedule?.id ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        {error && (
          <div className="flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={14} className="text-red-400 mt-0.5" /><p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Perangkat</label>
            <select className="input-field" value={form.device_id} onChange={e => setForm(f => ({ ...f, device_id: e.target.value }))} required>
              <option value="">Pilih perangkat</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Label Jadwal</label>
            <input className="input-field" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="cth: Jadwal Pagi" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Mulai</label>
              <input type="time" className="input-field" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
            </div>
            <div>
              <label className="label-field">Selesai</label>
              <input type="time" className="input-field" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label-field mb-2">Hari</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button key={d} type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.days.includes(d) ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (schedule?.id ? 'Simpan' : 'Tambah')}
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
    <div className="space-y-5">
      {modal !== null && (
        <ScheduleModal
          schedule={modal === 'add' ? null : modal}
          devices={devices}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Jadwal Penggunaan</h2>
          <p className="text-white/40 text-sm mt-1">{schedules.length} jadwal aktif</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : schedules.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Belum ada jadwal.</p>
          <button onClick={() => setModal('add')} className="btn-primary mt-4 text-sm px-6">Buat Jadwal</button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(sch => (
            <div key={sch.id} className="glass-card p-4 flex items-center gap-4 group hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{sch.label}</p>
                <p className="text-white/40 text-xs">{getDeviceName(sch.device_id)} · {sch.start_time} – {sch.end_time}</p>
                <div className="flex gap-1 mt-1">
                  {DAYS.map(d => (
                    <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${(sch.days || []).includes(d) ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/15'}`}>
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(sch)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(sch.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
