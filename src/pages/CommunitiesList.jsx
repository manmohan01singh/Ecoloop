import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Shield, Loader2, Lock } from 'lucide-react';
import { getCommunities } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORY_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'recycling', label: 'Daur Ulang' },
  { value: 'repair', label: 'Perbaikan' },
  { value: 'reuse', label: 'Pakai Ulang' },
  { value: 'ewaste', label: 'E-Waste' },
  { value: 'plastic', label: 'Plastik' },
  { value: 'textile', label: 'Tekstil' },
  { value: 'sustainability', label: 'Keberlanjutan' },
  { value: 'circular_business', label: 'Bisnis Sirkular' },
  { value: 'waste_problems', label: 'Masalah Sampah' },
  { value: 'general', label: 'Umum' },
];

const CATEGORY_COLORS = {
  recycling: 'bg-green-100 text-green-700',
  repair: 'bg-orange-100 text-orange-700',
  reuse: 'bg-teal-100 text-teal-700',
  ewaste: 'bg-blue-100 text-blue-700',
  plastic: 'bg-cyan-100 text-cyan-700',
  textile: 'bg-purple-100 text-purple-700',
  sustainability: 'bg-emerald-100 text-emerald-700',
  circular_business: 'bg-indigo-100 text-indigo-700',
  waste_problems: 'bg-red-100 text-red-700',
  general: 'bg-gray-100 text-gray-700',
};

function CommunityCard({ community }) {
  return (
    <Link
      to={`/community/${community.slug}`}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {community.icon ? (
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
            {community.icon}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">c/{community.name}</h3>
            {community.isVerified && (
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified" />
            )}
            {community.isPrivate && (
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" title="Private" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {community.description || 'Tidak ada deskripsi'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {community.memberCount.toLocaleString()}
              </span>
              <span>{community.postCount} post</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[community.category] || CATEGORY_COLORS.general}`}>
              {community.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunitiesList() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCommunities = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await getCommunities({
        search: search || undefined,
        category: category || undefined,
        page: currentPage,
        limit: 24,
      });
      const newItems = res.data.data.items;
      setCommunities(reset ? newItems : [...communities, ...newItems]);
      setHasMore(newItems.length === 24);
      if (reset) setPage(1);
    } catch (err) {
      toast.error('Gagal memuat komunitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(true);
  }, [search, category]);

  const handleLoadMore = () => {
    setPage(p => p + 1);
    fetchCommunities();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jelajahi Komunitas</h1>
          <p className="text-gray-500 text-sm mt-1">Temukan dan bergabung dengan komunitas sesuai minat kamu</p>
        </div>
        {isAuthenticated() && (
          <Link
            to="/community/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm">
            <Plus className="w-4 h-4" /> Buat Komunitas
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari komunitas..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            {CATEGORY_FILTERS.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Communities Grid */}
      {loading && communities.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada komunitas yang ditemukan</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map(c => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
