import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Recycle, MapPin, Package, TrendingUp, Plus, Loader2,
  CheckCircle, Clock, BarChart3, Leaf, DollarSign, Users
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import { getMyDeposits, getLocations } from '../services/communityService';
import toast from 'react-hot-toast';

export default function RecyclerDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [deposits, setDeposits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!['recycler', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [d, l] = await Promise.all([
          getMyDeposits(),
          getLocations({ limit: 10 }),
        ]);
        setDeposits(d.data.data || []);
        setLocations(l.data.data || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalKg = deposits.reduce((a, d) => a + parseFloat(d.weightKg || 0), 0);
  const totalValue = deposits.reduce((a, d) => a + parseFloat(d.totalValue || 0), 0);

  const TABS = [['overview', 'Overview'], ['deposits', 'My Deposits'], ['locations', 'Locations']];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Recycle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recycler Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name} · Track your recycling activity</p>
        </div>
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
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : tab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Total Deposits', value: deposits.length, color: 'green' },
              { icon: Leaf, label: 'Total kg Recycled', value: `${totalKg.toFixed(1)} kg`, color: 'emerald' },
              { icon: DollarSign, label: 'Total Value', value: `Rp ${totalValue.toLocaleString()}`, color: 'teal' },
              { icon: MapPin, label: 'Nearby Locations', value: locations.length, color: 'blue' },
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

          {/* Impact banner */}
          <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-6 h-6 text-green-200" />
              <h3 className="font-bold text-lg">Your Environmental Impact</h3>
            </div>
            <p className="text-green-100 text-sm mb-4">Every kilogram you recycle helps reduce e-waste in landfills.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{totalKg.toFixed(1)}</p>
                <p className="text-xs text-green-100">kg Recycled</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{deposits.length}</p>
                <p className="text-xs text-green-100">Deposits Made</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Plus, label: 'Record Deposit', desc: 'Log a new waste deposit', link: '/map', color: 'green' },
              { icon: MapPin, label: 'Find Locations', desc: 'Nearby recycling centers', link: '/map', color: 'blue' },
              { icon: BarChart3, label: 'View Impact', desc: 'Your EcoKarma & stats', link: '/eco-impact', color: 'emerald' },
            ].map(q => (
              <Link key={q.label} to={q.link}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 bg-${q.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <q.icon className={`w-5 h-5 text-${q.color}-600`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{q.label}</p>
                <p className="text-xs text-gray-500 mt-1">{q.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      ) : tab === 'deposits' ? (
        <div className="space-y-3">
          {deposits.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No deposits yet</p>
              <Link to="/map" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700">
                <MapPin className="w-4 h-4" /> Find a drop-off point
              </Link>
            </div>
          ) : deposits.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{d.material}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.provider?.businessName || 'Unknown provider'} · {new Date(d.depositDate || d.createdAt).toLocaleDateString('en')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-600">{parseFloat(d.weightKg).toFixed(2)} kg</p>
                <p className="text-xs text-gray-400">Rp {parseFloat(d.totalValue || 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

      ) : tab === 'locations' ? (
        <div className="space-y-3">
          {locations.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No locations found</p>
          ) : locations.map(loc => (
            <div key={loc.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {loc.category === 'recycling_center' ? '♻️' : loc.category === 'waste_bank' ? '🏦' : '📍'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{loc.name}</p>
                <p className="text-xs text-gray-400">{loc.address || ''} {loc.city}</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full capitalize flex-shrink-0">
                {loc.category?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
