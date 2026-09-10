import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Cpu, Plus, X, Loader2, ArrowRight } from 'lucide-react';
import { getDevices, createDevice } from '../services/deviceService';
import toast from 'react-hot-toast';

const CATEGORIES = ['smartphone', 'laptop', 'tablet', 'tv', 'refrigerator', 'washing_machine', 'ac', 'computer', 'printer', 'other'];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged'];
const ICONS = { smartphone: Smartphone, laptop: Laptop, tv: Monitor, computer: Cpu, printer: Cpu, tablet: Smartphone, other: Cpu };
const STATUS_COLORS = { excellent: 'text-emerald-700 bg-emerald-100', healthy: 'text-green-700 bg-green-100', warning: 'text-amber-700 bg-amber-100', critical: 'text-red-700 bg-red-100', dead: 'text-gray-700 bg-gray-100' };

function HealthRing({ score, size = 48 }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#22c55e' : score >= 40 ? '#f59e0b' : score >= 20 ? '#ef4444' : '#6b7280';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(score/100)*c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-900">{score}%</span>
      </div>
    </div>
  );
}

export default function Devices() {
  const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(searchParams.get('action') === 'add');
  const [form, setForm] = useState({ name: '', category: 'smartphone', brand: '', model: '', purchaseDate: '', condition: 'good', usageHoursPerDay: 4 });
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = () => {
    getDevices().then((res) => setDevices(res.data.data.items)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDevice(form);
      toast.success('Device added successfully!');
      setShowAdd(false);
      setForm({ name: '', category: 'smartphone', brand: '', model: '', purchaseDate: '', condition: 'good', usageHoursPerDay: 4 });
      fetchDevices();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add device');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
          <p className="text-gray-600 mt-1">{devices.length} devices tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all">
          <Plus className="w-5 h-5" /> Add Device
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {devices.map((device) => {
          const Icon = ICONS[device.category] || Smartphone;
          const dc = device.deathClock;
          return (
            <Link key={device.id} to={`/devices/${device.id}`} className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{device.name}</div>
                <div className="text-sm text-gray-500">{device.brand} {device.model} · {device.category}</div>
              </div>
              <HealthRing score={dc.healthScore} />
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">{dc.remainingDays} days</div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[dc.status]}`}>{dc.status}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </Link>
          );
        })}
        {devices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No devices yet. Add your first device!</p>
            <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
              Add Device
            </button>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Device</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Name *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="My iPhone 12" required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition *</label>
                  <select value={form.condition} onChange={(e) => setForm({...form, condition: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} placeholder="Apple"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                  <input value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} placeholder="iPhone 12"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Date *</label>
                  <input type="date" value={form.purchaseDate} onChange={(e) => setForm({...form, purchaseDate: e.target.value})} required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage (hrs/day)</label>
                  <input type="number" value={form.usageHoursPerDay} onChange={(e) => setForm({...form, usageHoursPerDay: e.target.value})} min="0" max="24" step="0.5"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Device'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
