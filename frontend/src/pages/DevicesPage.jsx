import { useState, useEffect } from 'react';
import { devices as devApi } from '../services/api';
import { Cpu, Plus, Pencil, Trash2, Zap, AlertCircle, X, CheckCircle2, MapPin } from 'lucide-react';

const CATEGORIES = ['AC', 'Kulkas', 'TV', 'Mesin Cuci', 'Komputer', 'Lampu', 'Kipas Angin', 'Microwave', 'Pompa Air', 'Lainnya'];

const categoryEmoji = {
  'AC': '', 'Kulkas': '', 'TV': '', 'Mesin Cuci': '',
  'Komputer': '', 'Lampu': '', 'Kipas Angin': '', 'Microwave': '',
  'Pompa Air': '', 'Lainnya': '',
};

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/35 backdrop-blur-[6px]">
      <div className="w-full sm:max-w-md animate-slide-up rounded-t-3xl sm:rounded-2xl p-6 bg-elevated shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              {device?.id ? 'Edit Perangkat' : 'Tambah Perangkat'}
            </h3>
            <p className="text-xs mt-0.5 text-text-muted">
              {device?.id ? 'Perbarui informasi perangkat' : 'Daftarkan perangkat baru'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-neutral-100 text-text-muted"
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
            <label className="label-field">Nama Perangkat</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="cth: AC Kamar Tidur"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Kategori</label>
              <select
                className="input-field"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Pilih kategori</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Daya (Watt)</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={form.power_watt}
                onChange={e => setForm(f => ({ ...f, power_watt: e.target.value }))}
                required
                placeholder="cth: 900"
              />
            </div>
          </div>
          <div>
            <label className="label-field">Lokasi</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
              <input
                className="input-field pl-10"
                value={form.location || ''}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="cth: Ruang Tamu"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading
                ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                : (device?.id ? 'Simpan' : 'Tambah')}
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
  const [modal, setModal]     = useState(null);
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
    <div className="page-shell">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl animate-slide-up bg-[#1C1C1E] text-white">
          <CheckCircle2 size={17} />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <DeviceModal
          device={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            showToast(modal === 'add' ? 'Perangkat ditambahkan!' : 'Perangkat diperbarui!');
            load();
          }}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[6px]">
          <div className="card card-hover p-6 sm:p-7 max-w-sm w-full text-center rounded-2xl animate-scale-in shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-danger/10">
              <Trash2 size={24} className="text-danger" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1.5 text-text-primary">Hapus Perangkat?</h3>
            <p className="text-sm mb-6 text-text-muted">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDel(null)} className="btn-secondary flex-1">Batal</button>
              <button
                onClick={() => handleDelete(delConfirm)}
                className="btn-primary flex-1"
                style={{ background: 'linear-gradient(135deg, #D94F4F, #C03030)', boxShadow: '0 2px 8px rgba(217,79,79,0.3)' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="font-display font-bold text-xl text-text-primary">Daftar Perangkat</h2>
          <p className="text-sm mt-0.5 text-text-muted">{devList.length} perangkat terdaftar</p>
        </div>
        <button
          id="btn-add-device"
          onClick={() => setModal('add')}
          className="btn-primary text-sm px-4 py-2.5"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 rounded-2xl skeleton" />
          ))}
        </div>
      ) : devList.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-base">
            <Cpu size={28} className="text-text-placeholder" />
          </div>
          <p className="font-semibold mb-1.5 text-text-secondary">Belum ada perangkat</p>
          <p className="text-sm mb-5 text-text-placeholder">Mulai tambahkan perangkat elektronik Anda</p>
          <button onClick={() => setModal('add')} className="btn-primary text-sm px-6">
            <Plus size={16} /> Tambah Perangkat
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devList.map(dev => (
            <div key={dev.id} className="card card-hover p-5 group transition-all duration-200 hover:-translate-y-1">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      dev.is_active ? 'bg-success/10 text-success' : 'bg-[#AEAEB2]/20 text-text-muted'
                    }`}
                  >
                    {dev.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModal(dev)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-neutral-100 text-text-muted"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDel(dev.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-50 text-text-muted"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Device info */}
              <h3 className="font-semibold mb-0.5 text-text-primary">{dev.name}</h3>
              {dev.location && (
                <p className="text-xs flex items-center gap-1 mb-3 text-text-placeholder">
                  <MapPin size={11} /> {dev.location}
                </p>
              )}

              {/* Power info */}
              <div className="flex items-center justify-between p-2.5 rounded-xl mt-3 bg-base">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-warning" />
                  <span className="text-sm font-bold text-[#B8760A]">{dev.power_watt}W</span>
                </div>
                <span className="text-xs text-text-placeholder">
                  ≈ {((dev.power_watt * 8) / 1000).toFixed(2)} kWh/hari
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
