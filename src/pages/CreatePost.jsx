import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { createPost, getCommunities } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'recycling', label: 'Daur Ulang' },
  { value: 'repair', label: 'Perbaikan' },
  { value: 'reuse', label: 'Pakai Ulang' },
  { value: 'ewaste', label: 'E-Waste' },
  { value: 'plastic', label: 'Plastik' },
  { value: 'textile', label: 'Tekstil' },
  { value: 'food_organic', label: 'Makanan/Organik' },
  { value: 'construction', label: 'Konstruksi' },
  { value: 'packaging', label: 'Kemasan' },
  { value: 'sustainability', label: 'Keberlanjutan' },
  { value: 'waste_problems', label: 'Masalah Sampah' },
  { value: 'circular_business', label: 'Bisnis Sirkular' },
  { value: 'general', label: 'Umum' },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    communityId: '',
    images: [],
    flair: '',
  });

  useEffect(() => {
    getCommunities({ limit: 50 })
      .then(res => setCommunities(res.data.data.items))
      .catch(() => toast.error('Gagal memuat komunitas'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        communityId: formData.communityId || null,
      };
      const res = await createPost(payload);
      toast.success('Post berhasil dibuat!');
      navigate(`/community/post/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Gagal membuat post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Post Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Community Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Komunitas <span className="text-gray-400">(opsional)</span>
            </label>
            <select
              value={formData.communityId}
              onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option value="">-- Posting ke feed umum --</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>c/{c.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Judul yang menarik dan deskriptif"
              maxLength={300}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/300</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Tulis cerita, tips, pertanyaan, atau pengalaman kamu..."
              rows={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Flair */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flair <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.flair}
              onChange={(e) => setFormData({ ...formData, flair: e.target.value })}
              placeholder="Contoh: Tips, Diskusi, Pertanyaan"
              maxLength={30}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Images placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar <span className="text-gray-400">(opsional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Upload gambar (coming soon)</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memposting...' : 'Buat Post'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
