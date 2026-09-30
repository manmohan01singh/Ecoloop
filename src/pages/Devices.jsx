import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Laptop, Monitor, Cpu, Plus, X, Loader2,
  ArrowRight, Camera, CheckCircle, AlertTriangle, Battery, Wrench
} from 'lucide-react';
import { getDevices, createDevice, uploadDeviceImage } from '../services/deviceService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'smartphone', 'laptop', 'tablet', 'tv', 'refrigerator',
  'washing_machine', 'ac', 'computer', 'printer', 'other'
];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged'];
const ICONS = {
  smartphone: Smartphone, laptop: Laptop, tv: Monitor,
  computer: Cpu, printer: Cpu, tablet: Smartphone, other: Cpu
};
const STATUS_COLORS = {
  excellent: 'text-emerald-700 bg-emerald-100',
  healthy:   'text-green-700 bg-green-100',
  warning:   'text-amber-700 bg-amber-100',
  critical:  'text-red-700 bg-red-100',
  dead:      'text-gray-700 bg-gray-100',
};
const ASSESSMENT_COLORS = {
  reuse:           'bg-blue-100 text-blue-700',
  repair:          'bg-orange-100 text-orange-700',
  donate:          'bg-pink-100 text-pink-700',
  sell:            'bg-amber-100 text-amber-700',
  refurbish:       'bg-purple-100 text-purple-700',
  recycle:         'bg-green-100 text-green-700',
  special_handling:'bg-red-100 text-red-700',
};

function getAssessment(dc) {
  if (!dc) return null;
  if (dc.healthScore >= 80) return 'reuse';
  if (dc.healthScore >= 60) return 'repair';
  if (dc.healthScore >= 40) return 'donate';
  if (dc.healthScore >= 20) return 'sell';
  if (dc.status === 'dead') return 'recycle';
  return 'recycle';
}

function HealthRing({ score, size = 48 }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#22c55e' : score >= 40 ? '#f59e0b' : score >= 20 ? '#ef4444' : '#6b7280';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${(score/100)*c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-900">{score}%</span>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: '', category: 'smartphone', brand: '', model: '',
  purchaseDate: '', condition: 'good', usageHoursPerDay: 4,
  isWorking: true, problemDescription: '', batteryHealth: '',
};

export default function Devices() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(searchParams.get('action') === 'add');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchDevices = () => {
    getDevices().then(r => setDevices(r.data.data.items)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchDevices(); }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10 MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        metadata: {
          isWorking: form.isWorking,
          problemDescription: form.problemDescription,
          batteryHealth: form.batteryHealth,
        },
      };
      const res = await createDevice(payload);
      const newDevice = res.data.data.device;

      // Upload photo if selected
      if (photoFile) {
        try {
          await uploadDeviceImage(newDevice.id, photoFile);
        } catch {
          toast.error('Device added but photo upload failed');
        }
      }

      toast.success('Device added!');
      setShowAdd(false);
      setForm(EMPTY_FORM);
      setPhotoFile(null);
      setPhotoPreview(null);
      fetchDevices();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add device');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
          <p className="text-gray-500 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all">
          <Plus className="w-5 h-5" /> Add Device
        </button>
      </div>

      {/* Device grid */}
      <div className="space-y-3">
        {devices.map((device) => {
          const Icon = ICONS[device.category] || Smartphone;
          const dc = device.deathClock;
          const assessment = getAssessment(dc);
          const imageUrl = device.metadata?.imageUrl;
          return (
            <Link key={device.id} to={`/devices/${device.id}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all group">
              {/* Thumbnail */}
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                {imageUrl
                  ? <img src={imageUrl} alt={device.name} className="w-full h-full object-cover" />
                  : <Icon className="w-6 h-6 text-emerald-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold text-gray-900 truncate">{device.name}</span>
                  {assessment && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ASSESSMENT_COLORS[assessment]}`}>
                      {assessment.replace('_', ' ')}
                    </span>
                  )}
                  {device.metadata?.isWorking === false && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Not Working</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {device.brand} {device.model} · {device.category.replace('_', ' ')}
                </div>
              </div>

              <HealthRing score={dc.healthScore} />

              <div className="text-right hidden sm:block flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">{dc.remainingDays}d left</div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[dc.status]}`}>
                  {dc.status}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            </Link>
          );
        })}

        {devices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No devices yet. Add your first device!</p>
            <button onClick={() => setShowAdd(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
              Add Device
            </button>
          </div>
        )}
      </div>

      {/* ── Add Device Modal ────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add New Device</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {/* Photo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {photoPreview
                      ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                      : <Camera className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG · max 10 MB</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="My iPhone 14" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {/* Category + Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition *</label>
                  <select value={form.condition} onChange={e => set('condition', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Brand + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                  <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Apple"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                  <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="iPhone 14"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Purchase date + Usage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Date *</label>
                  <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage (hrs/day)</label>
                  <input type="number" value={form.usageHoursPerDay} onChange={e => set('usageHoursPerDay', e.target.value)}
                    min="0" max="24" step="0.5"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Working status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Is the device working?</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => set('isWorking', true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.isWorking ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <CheckCircle className="w-4 h-4" /> Working
                  </button>
                  <button type="button" onClick={() => set('isWorking', false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      !form.isWorking ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <AlertTriangle className="w-4 h-4" /> Not Working
                  </button>
                </div>
              </div>

              {/* Problem description — shown when not working */}
              {!form.isWorking && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" /> Problem Description
                  </label>
                  <textarea value={form.problemDescription} onChange={e => set('problemDescription', e.target.value)}
                    rows={3} placeholder="Describe the issue — e.g. screen cracked, won't turn on..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
              )}

              {/* Battery health */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5" /> Battery Health (optional)
                </label>
                <input value={form.batteryHealth} onChange={e => set('batteryHealth', e.target.value)}
                  placeholder="e.g. 82% or 'Good'" maxLength={50}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {submitting ? 'Adding...' : 'Add Device'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
