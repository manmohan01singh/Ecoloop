import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, ThumbsUp, Clock, Plus, Loader2, X } from 'lucide-react';
import { getReports, createReport, upvoteReport } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';

const STATUS_STYLE = {
  reported: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  verified: 'bg-purple-100 text-purple-700',
  assigned: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-600',
};

function ReportModal({ onClose, onCreated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', description: '', category: 'illegal_dumping', address: '', city: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createReport(form);
      toast.success('Laporan berhasil dikirim!');
      onCreated(); onClose();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Gagal'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Laporkan Masalah Sampah</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            ⚠️ Laporan hanya akan ditampilkan di platform ini dan ditinjau oleh moderator. Laporan TIDAK diteruskan secara otomatis ke pihak berwajib atau pemerintah.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Contoh: Sampah menumpuk di pinggir jalan"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={3}
              placeholder="Jelaskan masalah secara detail..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Jl. Contoh No. 123"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jakarta"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Menyimpan...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports({ limit: 50 });
      setReports(res.data.data.items);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpvote = async (id) => {
    if (!isAuthenticated()) { toast.error('Login untuk mendukung laporan'); return; }
    try {
      await upvoteReport(id);
      setReports(rs => rs.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    } catch { toast.error('Gagal'); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reportsPage.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('reportsPage.subtitle')}</p>
        </div>
        {isAuthenticated() && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 text-sm">
            <Plus className="w-4 h-4" /> {t('reportsPage.createReport')}
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        ⚠️ {t('common.warning')}: Laporan di platform ini ditinjau oleh moderator komunitas. Laporan TIDAK diteruskan secara otomatis ke pemerintah atau pihak berwajib.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <button onClick={() => handleUpvote(r.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-colors min-w-[48px]">
                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">{r.upvotes}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                      {t(`reportsPage.statuses.${r.status}`)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {r.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {r.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.city}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {r.reporter && <span>{t('reportsPage.card.reportedBy')} {r.reporter.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada laporan</p>
            </div>
          )}
        </div>
      )}

      {showModal && <ReportModal onClose={() => setShowModal(false)} onCreated={fetchReports} />}
    </div>
  );
}
