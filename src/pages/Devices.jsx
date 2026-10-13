import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Laptop, Monitor, Cpu, Plus, X, Search, Filter,
  ArrowRight, Camera, CheckCircle, AlertTriangle, Battery, Wrench,
  Leaf, ShieldAlert, Sparkles, Activity, RefreshCw
} from 'lucide-react';
import { getDevices, createDevice, uploadDeviceImage } from '../services/deviceService';
import toast from 'react-hot-toast';
import { Button, Input, Modal, LoadingState, EmptyState, Badge, Card, StatCard } from '../components/ui';

const CATEGORIES = [
  'smartphone', 'laptop', 'tablet', 'tv', 'refrigerator',
  'washing_machine', 'ac', 'computer', 'printer', 'other'
];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged'];
const ICONS = {
  smartphone: Smartphone, laptop: Laptop, tv: Monitor,
  computer: Cpu, printer: Cpu, tablet: Smartphone, other: Cpu
};

const ASSESSMENT_COLORS = {
  reuse:           'bg-blue-50 text-blue-700 border-blue-200',
  repair:          'bg-orange-50 text-orange-700 border-orange-200',
  donate:          'bg-pink-50 text-pink-700 border-pink-200',
  sell:            'bg-amber-50 text-amber-700 border-amber-200',
  refurbish:       'bg-purple-50 text-purple-700 border-purple-200',
  recycle:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  special_handling:'bg-red-50 text-red-700 border-red-200',
};

function getAssessment(dc) {
  if (!dc) return 'recycle';
  if (dc.healthScore >= 80) return 'reuse';
  if (dc.healthScore >= 60) return 'repair';
  if (dc.healthScore >= 40) return 'donate';
  if (dc.healthScore >= 20) return 'sell';
  return 'recycle';
}

function HealthRing({ score = 100, size = 46 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const color = safeScore >= 80 ? '#10b981' : safeScore >= 60 ? '#22c55e' : safeScore >= 40 ? '#f59e0b' : safeScore >= 20 ? '#ef4444' : '#6b7280';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${(safeScore / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-gray-900 font-display">{safeScore}%</span>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchDevices = () => {
    getDevices()
      .then(r => setDevices(r.data.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDevices();
  }, []);

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

      if (photoFile) {
        try {
          await uploadDeviceImage(newDevice.id, photoFile);
        } catch {
          toast.error('Device added but photo upload failed');
        }
      }

      toast.success('Device added to tracking!');
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

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = !searchQuery ||
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.model?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [devices, searchQuery, selectedCategory]);

  // Computed summary metrics
  const stats = useMemo(() => {
    const total = devices.length;
    if (total === 0) return { total: 0, avgHealth: 100, needsAction: 0, co2Avoided: 0 };
    const totalHealth = devices.reduce((sum, d) => sum + (d.deathClock?.healthScore ?? 80), 0);
    const avgHealth = Math.round(totalHealth / total);
    const needsAction = devices.filter(d => (d.deathClock?.healthScore ?? 100) < 50 || d.metadata?.isWorking === false).length;
    const co2Avoided = total * 58; // avg 58 kg CO2 per tracked electronic item
    return { total, avgHealth, needsAction, co2Avoided };
  }, [devices]);

  if (loading) return <LoadingState size="lg" fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Device Lifecycle & Health
            </h1>
            <Badge variant="brand" size="sm">AI Diagnostic</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Monitor hardware lifespan, predict obsolescence, and unlock circular resale or repair actions.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={Plus} size="lg" className="shadow-sm">
          Register New Device
        </Button>
      </div>

      {/* ── KPI METRICS BANNER ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tracked Devices"
          value={stats.total}
          icon={Smartphone}
          color="emerald"
          caption="Active inventory in life-cycle registry"
        />
        <StatCard
          label="Avg Hardware Health"
          value={`${stats.avgHealth}%`}
          icon={Activity}
          color={stats.avgHealth >= 70 ? 'emerald' : stats.avgHealth >= 50 ? 'amber' : 'red'}
          caption="Aggregated predictive component score"
        />
        <StatCard
          label="Action Recommended"
          value={stats.needsAction}
          icon={ShieldAlert}
          color={stats.needsAction > 0 ? 'amber' : 'emerald'}
          caption={stats.needsAction > 0 ? 'Devices requiring repair or triage' : 'All devices in healthy parameters'}
        />
        <StatCard
          label="CO₂ Prevented"
          value={`${stats.co2Avoided} kg`}
          icon={Leaf}
          color="teal"
          caption="Avoided landfill manufacturing impact"
        />
      </div>

      {/* ── SEARCH & CATEGORY FILTERS ──────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by device name, brand (e.g. MacBook, Galaxy, iPad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories ({devices.length})
            </button>
            {CATEGORIES.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── DEVICE GRID / LIST ──────────────────────────────── */}
      {filteredDevices.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title={devices.length === 0 ? "No devices registered yet" : "No matching devices found"}
          description={
            devices.length === 0
              ? "Register your smartphone, laptop, or appliance to predict its death clock and calculate circular resale value."
              : "Try adjusting your search query or switching categories."
          }
          action={devices.length === 0 ? {
            label: 'Register First Device',
            onClick: () => setShowAdd(true),
            icon: Plus
          } : {
            label: 'Clear Filter',
            onClick: () => { setSearchQuery(''); setSelectedCategory('all'); },
            icon: RefreshCw,
            variant: 'secondary'
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const Icon = ICONS[device.category] || Smartphone;
            const dc = device.deathClock;
            const healthScore = dc?.healthScore ?? 85;
            const remainingDays = dc?.remainingDays ?? 365;
            const status = dc?.status || (healthScore > 70 ? 'healthy' : healthScore > 40 ? 'warning' : 'critical');
            const assessment = getAssessment(dc);
            const imageUrl = device.metadata?.imageUrl;
            const isWorking = device.metadata?.isWorking !== false;

            return (
              <Link
                key={device.id}
                to={`/devices/${device.id}`}
                className="group bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon, Health Ring & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      {imageUrl ? (
                        <img src={imageUrl} alt={device.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <HealthRing score={healthScore} />
                  </div>

                  {/* Device Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate text-base font-display">
                      {device.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {device.brand || 'Generic'} {device.model || ''} · <span className="capitalize">{device.category?.replace('_', ' ')}</span>
                    </p>
                  </div>

                  {/* Status & Assessment Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${ASSESSMENT_COLORS[assessment] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      Action: {assessment}
                    </span>
                    {!isWorking && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        Needs Repair
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Days Left & Arrow */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Est. {remainingDays}d operational lifespan</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── ADD DEVICE MODAL ────────────────────────────────── */}
      <Modal
        isOpen={showAdd}
        onClose={closeModal}
        title="Register Device for Lifecycle Diagnostics"
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Device Photo (Optional)</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  : <Camera className="w-7 h-7 text-gray-400" />}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {photoPreview ? 'Change Photo' : 'Upload Device Image'}
                </button>
                <p className="text-[11px] text-gray-500 mt-1">JPEG, PNG · Max 10 MB for AI visual analysis</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>
          </div>

          {/* Name */}
          <Input
            label="Device Nickname *"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Work Laptop, Living Room Smart TV, Daily Phone"
            required
          />

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Condition *</label>
              <select
                value={form.condition}
                onChange={e => set('condition', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="e.g. Apple, Samsung, Asus"
            />
            <Input
              label="Model"
              value={form.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="e.g. MacBook Pro M2, Galaxy S23"
            />
          </div>

          {/* Purchase date + Usage */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Purchase Date *"
              type="date"
              value={form.purchaseDate}
              onChange={(e) => set('purchaseDate', e.target.value)}
              required
            />
            <Input
              label="Daily Usage (hrs)"
              type="number"
              value={form.usageHoursPerDay}
              onChange={(e) => set('usageHoursPerDay', e.target.value)}
              min="0"
              max="24"
              step="0.5"
            />
          </div>

          {/* Working status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Operational State</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set('isWorking', true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  form.isWorking ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Operational / Normal
              </button>
              <button
                type="button"
                onClick={() => set('isWorking', false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  !form.isWorking ? 'border-red-400 bg-red-50 text-red-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-600" /> Malfunctioning / Non-working
              </button>
            </div>
          </div>

          {/* Problem description if non-working */}
          {!form.isWorking && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Problem Diagnostics
              </label>
              <textarea
                value={form.problemDescription}
                onChange={e => set('problemDescription', e.target.value)}
                rows={3}
                placeholder="Describe known symptoms (e.g. cracked display, boot loop, swollen battery)..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          )}

          {/* Battery health */}
          <Input
            label="Reported Battery Capacity (Optional)"
            value={form.batteryHealth}
            onChange={(e) => set('batteryHealth', e.target.value)}
            placeholder="e.g. 84% or Normal"
            maxLength={50}
          />

          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
            icon={Plus}
            size="lg"
            className="w-full font-bold shadow-md shadow-emerald-600/20"
          >
            {submitting ? 'Registering...' : 'Save & Compute Lifespan'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
