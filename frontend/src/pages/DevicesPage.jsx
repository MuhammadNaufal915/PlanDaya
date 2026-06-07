import { useState, useEffect } from 'react';
import { devices as devApi } from '../services/api';
import { Cpu, Plus, Pencil, Trash2, Zap, AlertCircle, X, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['AC', 'Kulkas', 'TV', 'Mesin Cuci', 'Komputer', 'Lampu', 'Kipas Angin', 'Microwave', 'Pompa Air', 'Lainnya'];

function DeviceModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(device || { name: '', category: '', power_watt: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (device?.id) {
        await devApi.update(device.id, { ...form, power_watt: Number(form.power_watt) });
      } else {
        await devApi.create({ ...form, power_watt: Number(form.power_watt) });
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perangkat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">{device?.id ? 'Edit Perangkat' : 'Tambah Perangkat'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        {error && (
          <div className="flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={14} className="text-red-400 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nama Perangkat</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="cth: AC Kamar Tidur" />
          </div>
          <div>
            <label className="label-field">Kategori</label>
            <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
              <option value="">Pilih kategori</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Daya (Watt)</label>
            <input className="input-field" type="number" min="1" value={form.power_watt} onChange={e => setForm(f => ({ ...f, power_watt: e.target.value }))} required placeholder="cth: 900" />
          </div>
          <div>
            <label className="label-field">Lokasi</label>
            <input className="input-field" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="cth: Ruang Tamu" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (device?.id ? 'Simpan' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'add' | device object
  const [delConfirm, setDel]  = useState(null);
  const [toast, setToast]     = useState('');

  const load = () => {
    setLoading(true);
    devApi.list().then(r => setDevList(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await devApi.delete(id);
      setDel(null);
      showToast('Perangkat berhasil dihapus');
      load();
    } catch {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white shadow-lg animate-slide-up">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <DeviceModal
          device={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); showToast(modal === 'add' ? 'Perangkat ditambahkan!' : 'Perangkat diperbarui!'); load(); }}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="glass-card p-6 max-w-sm w-full text-center animate-slide-up">
            <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Hapus Perangkat?</h3>
            <p className="text-white/50 text-sm mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDel(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={() => handleDelete(delConfirm)} className="btn-primary flex-1 bg-gradient-to-r from-red-600 to-red-500 shadow-none">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Daftar Perangkat</h2>
          <p className="text-white/40 text-sm mt-1">{devList.length} perangkat terdaftar</p>
        </div>
        <button id="btn-add-device" onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : devList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cpu size={48} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Belum ada perangkat.</p>
          <button onClick={() => setModal('add')} className="btn-primary mt-4 text-sm px-6">Tambah Perangkat</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devList.map(dev => (
            <div key={dev.id} className="glass-card p-5 hover:border-white/15 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dev.is_active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-white/20'}`} />
                  <span className="text-white/40 text-xs">{dev.category}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(dev)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDel(dev.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{dev.name}</h3>
              {dev.location && <p className="text-white/30 text-xs mb-3">{dev.location}</p>}
              <div className="flex items-center gap-1 mt-auto">
                <Zap size={14} className="text-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">{dev.power_watt}W</span>
                <span className="text-white/30 text-xs ml-1">≈ {((dev.power_watt * 8) / 1000).toFixed(2)} kWh/hari</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
