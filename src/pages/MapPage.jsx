import { useState, useEffect } from 'react';
import {
  MapPin, Phone, Clock, CheckCircle, AlertCircle, Plus,
  Search, ExternalLink, Navigation, Building2, Sparkles, Filter
} from 'lucide-react';
import { getLocations, submitLocation } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Badge, Card, LoadingState, EmptyState } from '../components/ui';

const CATEGORIES = [
  { id: '', label: 'All Drop-off Hubs', emoji: '📍' },
  { id: 'recycling_center', label: 'Recycling Centers', emoji: '♻️', color: 'success' },
  { id: 'waste_bank', label: 'Waste Banks (Bank Sampah)', emoji: '🏦', color: 'brand' },
  { id: 'collector', label: 'Mobile Collectors', emoji: '🚛', color: 'orange' },
  { id: 'repair_shop', label: 'Repair Workshops', emoji: '🔧', color: 'purple' },
  { id: 'collection_point', label: 'Drop-off Bins', emoji: '📦', color: 'info' },
];

function SubmitModal({ isOpen, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    name: '', category: 'waste_bank', address: '', city: 'Jakarta', province: 'DKI Jakarta', phone: ''
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, contact: { phone: form.phone } };
      await submitLocation(data);
      toast.success('Location submitted for verification! Thank you for contributing.');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit E-Waste Drop-off Hub" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Facility / Waste Bank Name *"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Bank Sampah Induk Jakarta Barat"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Facility Type</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.filter(c => c.id).map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="City *"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Jakarta Selatan"
            required
          />
        </div>

        <Input
          label="Full Street Address *"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="Jl. Fatmawati Raya No. 42..."
          required
        />

        <Input
          label="Contact Phone / WhatsApp"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+62 812..."
        />

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
          ℹ️ Submitted locations are reviewed by municipal moderators and added to the official network map.
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={saving}>
          Submit for Review
        </Button>
      </form>
    </Modal>
  );
}

export default function MapPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isAuthenticated } = useAuthStore();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.city = search;
      const res = await getLocations(params);
      setLocations(res.data.data || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedCategory]);

  const filteredLocations = locations.filter(loc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(q) ||
      loc.address?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
            E-Waste Resource Map
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Discover verified waste banks, recycling centers, and drop-off bins across Indonesia.
          </p>
        </div>

        {isAuthenticated() && (
          <Button
            onClick={() => setShowSubmit(true)}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Submit Drop-off Point
          </Button>
        )}
      </div>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────── */}
      <Card variant="flat" className="p-4 space-y-3 bg-white">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city (e.g. Jakarta, Bandung, Surabaya, Bali) or hub name..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => {
              const active = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── LOCATIONS LIST ─────────────────────────────────── */}
      {loading ? (
        <LoadingState size="lg" />
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No drop-off locations match your criteria"
          description="Try selecting a different category or clear the city search filter."
          action={isAuthenticated() ? {
            label: 'Submit a Drop-off Point',
            onClick: () => setShowSubmit(true),
            icon: Plus
          } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc) => {
            const catMeta = CATEGORIES.find(c => c.id === loc.category) || CATEGORIES[1];
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${loc.name} ${loc.address || ''} ${loc.city || ''}`
            )}`;

            return (
              <Card key={loc.id} variant="elevated" className="p-5 flex flex-col justify-between hover:border-emerald-300 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0">
                      {catMeta.emoji}
                    </div>
                    {loc.isVerified ? (
                      <Badge variant="brand" size="sm" dot>Verified Hub</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Community Entry</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base font-display group-hover:text-emerald-700 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {loc.address || 'Address on file with local chapter.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-800">{loc.city || 'Indonesia'}</span>
                    </div>
                    {loc.contact?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{loc.contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {catMeta.label}
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── SUBMIT MODAL ──────────────────────────────────── */}
      <SubmitModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmitted={() => fetchLocations()}
      />
    </div>
  );
}
