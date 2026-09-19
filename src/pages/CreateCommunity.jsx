import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Globe } from 'lucide-react';
import { createCommunity } from '../services/communityService';
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

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nama komunitas wajib diisi');
      return;
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      toast.error('Nama harus antara 3-50 karakter');
      return;
    }

    // Validate name format (alphanumeric, spaces, underscores)
    if (!/^[a-zA-Z0-9_ ]+$/.test(formData.name)) {
      toast.error('Nama hanya boleh mengandung huruf, angka, spasi, dan underscore');
      return;
    }

    setLoading(true);
    try {
      const res = await createCommunity(formData);
      toast.success('Komunitas berhasil dibuat!');
      const slug = res.data.data.slug;
      navigate(`/community/${slug}`);
    } catch (err) {
      const message = err.response?.data?.error?.message;
      if (message?.includes('taken')) {
        toast.error('Nama komunitas sudah digunakan');
      } else {
        toast.error(message || 'Gagal membuat komunitas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Komunitas Baru</h1>
        <p className="text-sm text-gray-500 mb-6">
          Bangun ruang diskusi untuk topik sirkular ekonomi yang kamu minati
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Komunitas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Zero Waste Indonesia"
              maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/50 karakter • Hanya huruf, angka, spasi, dan underscore
            </p>
            {formData.name && (
              <p className="text-xs text-emerald-600 mt-1">
                URL: c/{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 100)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan tentang apa komunitas ini..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Pilih kategori yang paling sesuai</p>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipe Komunitas <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: false })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">Publik</span>
                  </div>
                  <p className="text-sm text-gray-500">Siapa saja bisa melihat dan bergabung</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: true })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Privat</span>
                  </div>
                  <p className="text-sm text-gray-500">Hanya member yang disetujui yang bisa melihat konten</p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📌 Tips Komunitas yang Baik</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Pilih nama yang jelas dan mudah diingat</li>
              <li>Tulis deskripsi yang informatif</li>
              <li>Buat aturan komunitas yang jelas setelah komunitas dibuat</li>
              <li>Undang anggota yang relevan dengan topik</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Membuat...' : 'Buat Komunitas'}
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
