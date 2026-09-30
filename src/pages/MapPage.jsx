import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, CheckCircle, AlertCircle, Loader2, X, Plus } from 'lucide-react';
import { getLocations, submitLocation } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  recycling_center: 'Recycling Center',
  waste_bank: 'Waste Bank',
  collector: 'Collector',
  repair_shop: 'Repair Shop',
  collection_point: 'Collection Point',
  community_hub: 'Community Hub',
  donation_center: 'Donation Center',
  other: 'Other',
};

const CATEGORY_COLORS = {
  recycling_center: 'bg-green-100 text-green-700 border-green-200',
  waste_bank: 'bg-blue-100 text-blue-700 border-blue-200',
  collector: 'bg-orange-100 text-orange-700 border-orange-200',
  repair_shop: 'bg-purple-100 text-purple-700 border-purple-200',
  collection_point: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  community_hub: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  donation_center: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const CATEGORY_EMOJI = {
  recycling_center: '♻️', waste_bank: '🏦', collector: '🚛',
  repair_shop: '🔧', collection_point: '📦', community_hub: '🏘️',
  donation_center: '❤️', other: '📍',
};

function SubmitModal({ onClose, onSubmitted }) {
  const [form, setForm] = useState({ name: '', category: 'recycling_center', address: '', city: '', province: '', phone: '', lat: '', lng: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, contact: { phone: form.phone }, lat: form.lat || undefined, lng: form.lng || undefined };
      await submitLocation(data);
      toast.success('Location submitted! It will be reviewed by an admin.');
      onSubmitted(); onClose();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Submit New Location</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Community Waste Bank RW 05"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="DKI Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+62812..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Submitted locations will be reviewed by an admin before being displayed. Do not claim "verified" status for unverified locations.
          </p>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Submit Location'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      if (filterCity) params.city = filterCity;
      const res = await getLocations(params);
      setLocations(res.data.data);
    } catch { toast.error('Failed to load locations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Map</h1>
          <p className="text-gray-500 text-sm mt-1">Waste banks, recycling centers, repair shops, and collection points</p>
        </div>
        {isAuthenticated() && (
          <button onClick={() => setShowSubmit(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> Submit Location
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Types</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
          placeholder="Filter by city..." onKeyDown={e => e.key === 'Enter' && fetchLocations()}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44" />
        <button onClick={fetchLocations} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800">
          Search
        </button>
      </div>

      {/* Demo notice */}
      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>All locations shown are <strong>Demo Locations</strong> and have not been verified. Do not use as a reference for real locations. Locations are only verified after manual admin confirmation.</span>
      </div>

      {/* Map placeholder + list */}
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : locations.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No locations found</p>
            </div>
          ) : locations.map(loc => (
            <div key={loc.id}
              onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === loc.id ? 'border-emerald-400 shadow-md' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-0.5">{CATEGORY_EMOJI[loc.category] || '📍'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">{loc.name}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {loc.isDemo && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Demo</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${CATEGORY_COLORS[loc.category]}`}>
                        {CATEGORY_LABELS[loc.category]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {loc.address ? `${loc.address}, ` : ''}{loc.city}
                  </div>

                  {selected?.id === loc.id && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                      {loc.acceptedMaterials?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Accepted Materials:</p>
                          <div className="flex flex-wrap gap-1">
                            {loc.acceptedMaterials.map(m => (
                              <span key={m} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {loc.openingHours && (
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                          <div>
                            {Object.entries(loc.openingHours).map(([k, v]) => (
                              <div key={k}><span className="capitalize">{k.replace('_', '-')}</span>: {v}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {loc.contact?.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {loc.contact.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs">
                        {loc.verificationStatus === 'admin_verified' ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600">Admin Verified</span></>
                        ) : loc.verificationStatus === 'community_verified' ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-blue-500" /><span className="text-blue-600">Community Verified</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600">Not Verified</span></>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Static map placeholder */}
        <div className="hidden xl:block w-96 flex-shrink-0">
          <div className="sticky top-20 bg-gray-100 rounded-xl overflow-hidden h-[600px] flex flex-col items-center justify-center text-center p-8 border border-gray-200">
            <MapPin className="w-12 h-12 text-emerald-400 mb-4" />
            <p className="font-semibold text-gray-700 mb-2">Interactive Map</p>
            <p className="text-sm text-gray-500 mb-4">Install leaflet to enable the interactive map:</p>
            <code className="text-xs bg-white px-3 py-2 rounded-lg border text-gray-600 font-mono">npm install leaflet react-leaflet</code>
            <p className="text-xs text-gray-400 mt-4">Coordinates available for all {locations.length} locations</p>
          </div>
        </div>
      </div>

      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} onSubmitted={fetchLocations} />}
    </div>
  );
}
