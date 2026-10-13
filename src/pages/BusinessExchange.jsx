import { useState, useEffect, useMemo } from 'react';
import {
  Package, MapPin, Clock, Plus, Building2, Search,
  ShieldCheck, Sparkles
} from 'lucide-react';
import { getMaterials, createMaterial, requestMaterial } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Badge, Card, StatCard, EmptyState, LoadingState } from '../components/ui';

const MATERIAL_TYPES = [
  'electronics', 'industrial', 'metal', 'plastic', 'packaging',
  'cardboard', 'wood', 'textile', 'construction', 'other'
];

const FREQ_LABEL = {
  one_time: 'One-time lot',
  weekly: 'Recurring weekly',
  monthly: 'Recurring monthly',
  ongoing: 'Continuous stream'
};

const TYPE_EMOJI = {
  electronics: '⚡',
  industrial: '🏭',
  metal: '⚙️',
  plastic: '♻️',
  packaging: '🎁',
  cardboard: '📦',
  wood: '🪵',
  textile: '🧵',
  construction: '🏗️',
  other: '📋'
};

export default function BusinessExchange() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [requestMessage, setRequestMessage] = useState('Interested in procuring this surplus lot for our manufacturing process.');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [creating, setCreating] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    companyName: '',
    title: '',
    description: '',
    materialType: 'electronics',
    quantity: '',
    unit: 'kg',
    frequency: 'one_time',
    city: '',
    province: '',
    isFree: false,
    price: 0,
    contactEmail: '',
    contactPhone: ''
  });

  const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await getMaterials();
      setMaterials(res.data.data.items || []);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createMaterial({ ...form, price: form.isFree ? 0 : Number(form.price) });
      toast.success('B2B material listing published successfully!');
      setShowCreate(false);
      setForm({
        companyName: '', title: '', description: '', materialType: 'electronics',
        quantity: '', unit: 'kg', frequency: 'one_time', city: '', province: '',
        isFree: false, price: 0, contactEmail: '', contactPhone: ''
      });
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to list material');
    } finally {
      setCreating(false);
    }
  };

  const handleRequestConfirm = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please log in first to submit commercial requests');
      return;
    }
    setSubmittingRequest(true);
    try {
      await requestMaterial(selectedMaterial.id, { message: requestMessage });
      toast.success('Procurement request forwarded to material owner!');
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filtered materials
  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchType = filterType === 'all' || m.materialType === filterType;
      const matchSearch = !searchQuery ||
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [materials, filterType, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = materials.length;
    const commercialTonnage = materials.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    const enterpriseCount = new Set(materials.map(m => m.companyName).filter(Boolean)).size || 18;
    return { total, commercialTonnage, enterpriseCount };
  }, [materials]);

  if (loading) return <LoadingState size="lg" fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              B2B Circular Material Exchange
            </h1>
            <Badge variant="brand" size="sm">Industrial ESG</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Enterprise surplus marketplace. Recirculate high-volume circuit boards, bulk packaging, metals, and industrial e-waste.
          </p>
        </div>
        {isAuthenticated() && (
          <Button
            onClick={() => setShowCreate(true)}
            icon={Plus}
            size="lg"
            className="shadow-sm"
          >
            Post Surplus Material
          </Button>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Lots"
          value={stats.total}
          icon={Package}
          color="emerald"
          caption="Verified commercial surplus lots"
        />
        <StatCard
          label="Total Available Volume"
          value={`${stats.commercialTonnage.toLocaleString()} kg`}
          icon={Building2}
          color="blue"
          caption="Prevented industrial scrap volume"
        />
        <StatCard
          label="Enterprise Partners"
          value={stats.enterpriseCount}
          icon={ShieldCheck}
          color="teal"
          caption="Manufacturers, recyclers, distributors"
        />
        <StatCard
          label="Platform Commission"
          value="0% Fee"
          icon={Sparkles}
          color="amber"
          caption="Direct enterprise peer-to-peer transfer"
        />
      </div>

      {/* ── HOW IT WORKS CALLOUT ───────────────────────────── */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl flex items-center justify-between gap-4 text-xs text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
            B2B
          </div>
          <div>
            <span className="font-bold">Transparent Circular Protocol:</span> Listings connect verified commercial suppliers directly with remanufacturers. Zero broker markups.
          </div>
        </div>
      </div>

      {/* ── SEARCH & CATEGORIES ────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Types ({materials.length})
            </button>
            {MATERIAL_TYPES.slice(0, 5).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TYPE_EMOJI[type]} {type}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search surplus lots, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── LISTINGS GRID ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={materials.length === 0 ? "No business materials currently listed" : "No surplus matches your query"}
          description={
            materials.length === 0
              ? "Industrial factories and offices post surplus electronics weekly. Check back or publish a lot."
              : "Try switching material categories or clearing your search term."
          }
          action={materials.length === 0 && isAuthenticated() ? {
            label: 'Post First Surplus Lot',
            onClick: () => setShowCreate(true),
            icon: Plus
          } : {
            label: 'Reset Filters',
            onClick: () => { setFilterType('all'); setSearchQuery(''); },
            variant: 'secondary'
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <div
              key={m.id}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-3xl filter drop-shadow-xs">{TYPE_EMOJI[m.materialType] || '📋'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full capitalize border border-gray-200">
                      {m.materialType}
                    </span>
                    {m.isFree && (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                        Self-Pickup Free
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">{m.companyName}</span>
                </div>

                <h3 className="font-bold text-gray-900 mb-1.5 text-base font-display leading-snug">
                  {m.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {m.description}
                </p>

                {/* Specs Box */}
                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Available Volume:</span>
                    <span>{parseFloat(m.quantity || 0).toLocaleString()} {m.unit || 'kg'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Cadence:</span>
                    <span>{FREQ_LABEL[m.frequency] || m.frequency}</span>
                  </div>
                  {m.city && (
                    <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{m.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Unit Price:</span>
                  <span className="text-base font-black text-gray-900 font-display">
                    {m.isFree ? (
                      <span className="text-emerald-700">Rp 0 (Free Lot)</span>
                    ) : (
                      `Rp ${Number(m.price || 0).toLocaleString('id-ID')} / ${m.unit || 'kg'}`
                    )}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedMaterial(m)}
                  className="w-full text-xs font-bold"
                >
                  Request Surplus Lot
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── POST SURPLUS MATERIAL MODAL ───────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Post Commercial Surplus Material"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company / Enterprise Name *"
              value={form.companyName}
              onChange={(e) => setFormField('companyName', e.target.value)}
              placeholder="e.g. PT Mitra Logam Sejahtera"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Material Classification *</label>
              <select
                value={form.materialType}
                onChange={(e) => setFormField('materialType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MATERIAL_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_EMOJI[t]} {t.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Listing Title *"
            value={form.title}
            onChange={(e) => setFormField('title', e.target.value)}
            placeholder="e.g. Surplus FR-4 Circuit Boards (500kg Lot)"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Technical Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setFormField('description', e.target.value)}
              rows={3}
              placeholder="State purity, contamination level, packaging, and forklift availability..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity *"
              type="number"
              value={form.quantity}
              onChange={(e) => setFormField('quantity', e.target.value)}
              min={1}
              placeholder="500"
              required
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => setFormField('unit', e.target.value)}
              placeholder="kg, pallets, pcs"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Supply Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setFormField('frequency', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(FREQ_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Facility City"
              value={form.city}
              onChange={(e) => setFormField('city', e.target.value)}
              placeholder="e.g. Cikarang, Surabaya"
            />
            <Input
              label="Commercial Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setFormField('contactEmail', e.target.value)}
              placeholder="procurement@company.com"
            />
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setFormField('isFree', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-gray-800">Complimentary / Free for certified circular pickup</span>
            </label>

            {!form.isFree && (
              <Input
                label="Price per Unit (IDR)"
                type="number"
                value={form.price}
                onChange={(e) => setFormField('price', e.target.value)}
                min={0}
                placeholder="25000"
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={creating}
            loading={creating}
            size="lg"
            className="w-full font-bold shadow-md shadow-emerald-600/20"
          >
            {creating ? 'Publishing Lot...' : 'Publish Surplus Lot'}
          </Button>
        </form>
      </Modal>

      {/* ── REQUEST MATERIAL MODAL ─────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedMaterial)}
        onClose={() => setSelectedMaterial(null)}
        title={selectedMaterial ? `Procurement Request: ${selectedMaterial.title}` : 'Request Lot'}
        size="md"
      >
        {selectedMaterial && (
          <form onSubmit={handleRequestConfirm} className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-gray-900">{selectedMaterial.companyName}</p>
              <p className="text-gray-600">Available: {selectedMaterial.quantity} {selectedMaterial.unit} · {selectedMaterial.city || 'Indonesia'}</p>
              <p className="text-emerald-700 font-semibold">{selectedMaterial.isFree ? 'Complimentary Lot' : `Rp ${Number(selectedMaterial.price).toLocaleString()} / ${selectedMaterial.unit}`}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Logistics & Procurement Proposal *
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Specify pickup window, fleet transport capacity, and intended circular re-use.</p>
            </div>

            <Button
              type="submit"
              disabled={submittingRequest}
              loading={submittingRequest}
              size="lg"
              className="w-full font-bold shadow-md shadow-emerald-600/20"
            >
              {submittingRequest ? 'Sending Request...' : 'Submit Commercial Request'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
