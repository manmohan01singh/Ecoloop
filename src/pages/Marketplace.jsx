import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Package, Loader2, X, ChevronDown } from 'lucide-react';
import { getListings, createListing } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = ['electronics', 'plastic', 'metal', 'paper_cardboard', 'glass', 'textile', 'furniture', 'appliances', 'organic', 'construction', 'other'];
const ACTIONS = [
  { value: 'give_away', label: 'Berikan', emoji: '🎁', color: 'bg-blue-100 text-blue-700' },
  { value: 'sell', label: 'Jual', emoji: '💰', color: 'bg-amber-100 text-amber-700' },
  { value: 'donate', label: 'Donasi', emoji: '❤️', color: 'bg-red-100 text-red-700' },
  { value: 'repair', label: 'Perbaiki', emoji: '🔧', color: 'bg-orange-100 text-orange-700' },
  { value: 'reuse', label: 'Pakai Ulang', emoji: '🔄', color: 'bg-green-100 text-green-700' },
  { value: 'recycle', label: 'Daur Ulang', emoji: '♻️', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'parts', label: 'Suku Cadang', emoji: '🔩', color: 'bg-gray-100 text-gray-700' },
];
const CONDITIONS = ['like_new', 'good', 'fair', 'poor', 'for_parts'];

function ActionBadge({ action }) {
  const a = ACTIONS.find(x => x.value === action) || ACTIONS[0];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.color}`}>{a.emoji} {a.label}</span>;
}

function CreateListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'electronics', condition: 'good',
    quantity: 1, unit: 'pcs', city: '', province: '', circularAction: 'give_away',
    isFree: true, price: 0, pickupType: 'both',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createListing(form);
      toast.success('Listing dibuat!');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Gagal'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Buat Listing Baru</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Contoh: Laptop Lenovo bekas" required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Ceritakan kondisi dan detail barang..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aksi Sirkular *</label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIONS.map(a => (
                <button key={a.value} type="button" onClick={() => set('circularAction', a.value)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 text-xs font-medium transition-all ${form.circularAction === a.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="text-lg mb-0.5">{a.emoji}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} min={1}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Gratis</span>
            </label>
            {!form.isFree && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-500">Rp</span>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} min={0} placeholder="Harga"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Menyimpan...' : 'Buat Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({
    search: '', category: searchParams.get('category') || '',
    circularAction: searchParams.get('circularAction') || '',
    city: '', isFree: '',
  });
  const { isAuthenticated } = useAuthStore();

  const fetchListings = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.circularAction) params.circularAction = f.circularAction;
      if (f.city) params.city = f.city;
      if (f.isFree !== '') params.isFree = f.isFree;
      const res = await getListings(params);
      setListings(res.data.data.items);
    } catch { toast.error('Gagal memuat'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Sirkular</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} item tersedia</p>
        </div>
        {isAuthenticated() && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> Buat Listing
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && fetchListings()}
            placeholder="Cari barang..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={filters.circularAction} onChange={e => { const v = {...filters, circularAction: e.target.value}; setFilters(v); fetchListings(v); }}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Semua Aksi</option>
          {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.emoji} {a.label}</option>)}
        </select>
        <select value={filters.category} onChange={e => { const v = {...filters, category: e.target.value}; setFilters(v); fetchListings(v); }}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <select value={filters.isFree} onChange={e => { const v = {...filters, isFree: e.target.value}; setFilters(v); fetchListings(v); }}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Gratis & Berbayar</option>
          <option value="true">Gratis Saja</option>
          <option value="false">Berbayar</option>
        </select>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map(l => (
            <Link key={l.id} to={`/marketplace/${l.id}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {l.images?.[0] ? (
                  <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{l.title}</h3>
                  <ActionBadge action={l.circularAction} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />{l.city || 'Indonesia'}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${l.isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {l.isFree ? 'GRATIS' : `Rp ${Number(l.price).toLocaleString('id')}`}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{l.condition?.replace('_', ' ')}</span>
                </div>
              </div>
            </Link>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada listing ditemukan</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} onCreated={fetchListings} />}
    </div>
  );
}
