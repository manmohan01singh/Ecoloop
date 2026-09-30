import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Building2, Package, TrendingUp, Plus, Loader2,
  CheckCircle, Clock, DollarSign, Inbox, BarChart3, ArrowRight
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import { getMyMaterials, getMaterials } from '../services/communityService';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  listed: 'bg-blue-100 text-blue-700',
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const TYPE_EMOJI = {
  cardboard: '📦', plastic: '♻️', wood: '🪵', textile: '🧵',
  packaging: '🎁', construction: '🏗️', electronics: '⚡',
  industrial: '🏭', metal: '⚙️', other: '📋',
};

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [myMaterials, setMyMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!['business', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mine, all] = await Promise.all([
          getMyMaterials(),
          getMaterials({ limit: 10 }),
        ]);
        setMyMaterials(mine.data.data || []);
        setAllMaterials(all.data.data.items || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeMaterials = myMaterials.filter(m => m.status === 'listed');
  const requestedMaterials = myMaterials.filter(m => m.status === 'requested');
  const completedMaterials = myMaterials.filter(m => m.status === 'completed');
  const totalValue = myMaterials.reduce((a, m) => a + parseFloat(m.price || 0) * parseFloat(m.quantity || 0), 0);

  const TABS = [
    ['overview', 'Overview'],
    ['my_listings', 'My Listings'],
    ['marketplace', 'Browse Exchange'],
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.name} · Material Exchange Hub</p>
          </div>
        </div>
        <Link to="/business"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 text-sm">
          <Plus className="w-4 h-4" /> List Material
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : tab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Active Listings', value: activeMaterials.length, color: 'blue' },
              { icon: Inbox, label: 'Pending Requests', value: requestedMaterials.length, color: 'yellow' },
              { icon: CheckCircle, label: 'Completed Deals', value: completedMaterials.length, color: 'green' },
              { icon: DollarSign, label: 'Total Listed Value', value: `Rp ${totalValue.toLocaleString()}`, color: 'indigo' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
            <Building2 className="w-6 h-6 text-indigo-200 mb-2" />
            <h3 className="font-bold text-lg mb-1">B2B Material Exchange</h3>
            <p className="text-indigo-100 text-sm mb-4">List your surplus materials and connect with other businesses. No intermediary, no commission — direct circular economy.</p>
            <Link to="/business" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50">
              Go to Exchange <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* My active listings */}
          {myMaterials.length > 0 && (
            <div className="bg-white border border-indigo-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">My Listings</h3>
                <button onClick={() => setTab('my_listings')} className="text-xs text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {myMaterials.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <span className="text-2xl">{TYPE_EMOJI[m.materialType] || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{parseFloat(m.quantity).toLocaleString()} {m.unit} · {m.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[m.status]}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      ) : tab === 'my_listings' ? (
        <div className="space-y-3">
          {myMaterials.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No listings yet</p>
              <Link to="/business" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Create your first listing
              </Link>
            </div>
          ) : myMaterials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl flex-shrink-0">{TYPE_EMOJI[m.materialType] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{m.title}</p>
                <p className="text-sm text-gray-500">{m.companyName} · {parseFloat(m.quantity).toLocaleString()} {m.unit}</p>
                <p className="text-xs text-gray-400">{m.city} · {m.requestCount} requests</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[m.status]}`}>
                  {m.status}
                </span>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {m.isFree ? 'FREE' : `Rp ${Number(m.price).toLocaleString()}/${m.unit}`}
                </p>
              </div>
            </div>
          ))}
        </div>

      ) : tab === 'marketplace' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Available materials from other businesses</p>
            <Link to="/business" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Open Exchange <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {allMaterials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl flex-shrink-0">{TYPE_EMOJI[m.materialType] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{m.title}</p>
                <p className="text-sm text-gray-500">{m.companyName}</p>
                <p className="text-xs text-gray-400">{parseFloat(m.quantity).toLocaleString()} {m.unit} · {m.city}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  {m.isFree ? 'FREE' : `Rp ${Number(m.price).toLocaleString()}/${m.unit}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
