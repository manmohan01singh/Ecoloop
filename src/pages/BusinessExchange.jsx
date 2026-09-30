import { useState, useEffect } from 'react';
import { Package, MapPin, Clock, Plus, Loader2, X, Building2 } from 'lucide-react';
import { getMaterials, createMaterial, requestMaterial } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const MATERIAL_TYPES = ['cardboard', 'plastic', 'wood', 'textile', 'packaging', 'construction', 'electronics', 'industrial', 'metal', 'other'];
const FREQ_LABEL = { one_time: 'One-time', weekly: 'Weekly', monthly: 'Monthly', ongoing: 'Ongoing' };
const TYPE_EMOJI = { cardboard: '📦', plastic: '♻️', wood: '🪵', textile: '🧵', packaging: '🎁', construction: '🏗️', electronics: '⚡', industrial: '🏭', metal: '⚙️', other: '📋' };

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ companyName: '', title: '', description: '', materialType: 'cardboard', quantity: '', unit: 'kg', frequency: 'one_time', city: '', province: '', isFree: false, price: 0, contactEmail: '', contactPhone: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMaterial({ ...form, price: form.isFree ? 0 : form.price });
      toast.success('Material listed successfully!');
      onCreated(); onClose();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">List Business Material</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)} required placeholder="Company Ltd."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Type *</label>
              <select value={form.materialType} onChange={e => set('materialType', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Surplus Double-Wall Cardboard 500kg"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Describe the condition, size, and details..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} required min={0} placeholder="100"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="kg"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="contact@company.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Free / Self-pickup</span>
            </label>
            {!form.isFree && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-500">Rp/unit</span>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} min={0}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            )}
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'List Material'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BusinessExchange() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('');
  const { isAuthenticated } = useAuthStore();

  const fetchMaterials = async (type = filterType) => {
    setLoading(true);
    try {
      const params = type ? { materialType: type } : {};
      const res = await getMaterials(params);
      setMaterials(res.data.data.items);
    } catch { toast.error('Failed to load materials'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleRequest = async (id) => {
    if (!isAuthenticated()) { toast.error('Please log in first'); return; }
    try {
      await requestMaterial(id, { message: 'Interested in this material.' });
      toast.success('Request sent!');
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Material Exchange</h1>
          <p className="text-gray-500 text-sm mt-1">Business to business — surplus materials for reuse</p>
        </div>
        {isAuthenticated() && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> List Material
          </button>
        )}
      </div>

      <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
        <strong>How it works:</strong> Businesses list surplus materials → Other businesses submit requests → Owner approves → Exchange complete. No intermediary, no commission.
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => { setFilterType(''); fetchMaterials(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {MATERIAL_TYPES.map(t => (
          <button key={t} onClick={() => { setFilterType(t); fetchMaterials(t); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {TYPE_EMOJI[t]} {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{TYPE_EMOJI[m.materialType] || '📋'}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium capitalize">{m.materialType}</span>
                  {m.isFree && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Free</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">{m.companyName}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 leading-snug">{m.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.description}</p>

              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  {parseFloat(m.quantity).toLocaleString()} {m.unit} · {FREQ_LABEL[m.frequency]}
                </div>
                {m.city && <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{m.city}
                </div>}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {m.requestCount} requests received
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-bold ${m.isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {m.isFree ? 'FREE' : `Rp ${Number(m.price).toLocaleString('en')}/${m.unit}`}
                </span>
              </div>

              <button onClick={() => handleRequest(m.id)}
                className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-sm hover:bg-emerald-700 transition-colors">
                Request This Material
              </button>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No materials listed yet</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchMaterials} />}
    </div>
  );
}
