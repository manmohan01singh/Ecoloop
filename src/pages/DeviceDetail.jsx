import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Smartphone, Laptop, Monitor, Cpu, Clock, Calendar,
  Activity, Sparkles, CheckCircle, Info, Camera, Trash2,
  Edit3, Save, X, Battery, Wrench, AlertTriangle, Recycle,
  Heart, ShoppingBag, RefreshCw, Zap, Package
} from 'lucide-react';
import { getDevice, updateDevice, deleteDevice, getAIRecommendations, uploadDeviceImage } from '../services/deviceService';
import toast from 'react-hot-toast';
import { Button, Input, LoadingState, ProgressBar } from '../components/ui';

const ICONS = { smartphone: Smartphone, laptop: Laptop, tv: Monitor, computer: Cpu, printer: Cpu, tablet: Smartphone, other: Cpu };
const STATUS_CONFIG = {
  excellent: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Excellent' },
  healthy:   { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Healthy' },
  warning:   { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Warning' },
  critical:  { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Critical' },
  dead:      { bg: 'bg-gray-100',    text: 'text-gray-700',    label: 'End of Life' },
};

const ASSESSMENT_OPTIONS = [
  { key: 'reuse',            icon: RefreshCw,   color: 'bg-blue-50 border-blue-300 text-blue-700',    label: 'Reuse',            desc: 'Still functional — keep using or pass on' },
  { key: 'repair',           icon: Wrench,      color: 'bg-orange-50 border-orange-300 text-orange-700', label: 'Repair',        desc: 'Fix the issue to extend its life' },
  { key: 'donate',           icon: Heart,       color: 'bg-pink-50 border-pink-300 text-pink-700',    label: 'Donate',           desc: 'Give to someone who needs it' },
  { key: 'sell',             icon: ShoppingBag, color: 'bg-amber-50 border-amber-300 text-amber-700', label: 'Sell',             desc: 'List on the marketplace' },
  { key: 'refurbish',        icon: Zap,         color: 'bg-purple-50 border-purple-300 text-purple-700', label: 'Refurbish',    desc: 'Restore to resell or donate' },
  { key: 'recycle',          icon: Recycle,     color: 'bg-green-50 border-green-300 text-green-700', label: 'Recycle',          desc: 'Responsible disposal at a recycling point' },
  { key: 'special_handling', icon: Package,     color: 'bg-red-50 border-red-300 text-red-700',       label: 'Special Handling', desc: 'Hazardous materials — needs certified recycler' },
];

function getAutoAssessment(dc) {
  if (!dc) return 'recycle';
  if (dc.healthScore >= 80) return 'reuse';
  if (dc.healthScore >= 60) return 'repair';
  if (dc.healthScore >= 40) return 'donate';
  if (dc.healthScore >= 25) return 'sell';
  return 'recycle';
}

const CATEGORIES   = ['smartphone','laptop','tablet','tv','refrigerator','washing_machine','ac','computer','printer','other'];
const CONDITIONS   = ['excellent','good','fair','poor','damaged'];

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const [device, setDevice]     = useState(null);
  const [dc, setDc]             = useState(null);
  const [aiRec, setAiRec]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editForm, setEditForm] = useState({});

  const fetchDevice = () => {
    setLoading(true);
    getDevice(id)
      .then(res => {
        setDevice(res.data.data.device);
        setDc(res.data.data.deathClock);
      })
      .catch(() => toast.error('Device not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevice(); }, [id]);

  const startEdit = () => {
    setEditForm({
      name:             device.name,
      brand:            device.brand || '',
      model:            device.model || '',
      category:         device.category,
      condition:        device.condition,
      usageHoursPerDay: device.usageHoursPerDay,
      isWorking:        device.metadata?.isWorking !== false,
      problemDescription: device.metadata?.problemDescription || '',
      batteryHealth:    device.metadata?.batteryHealth || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name:             editForm.name,
        brand:            editForm.brand,
        model:            editForm.model,
        category:         editForm.category,
        condition:        editForm.condition,
        usageHoursPerDay: editForm.usageHoursPerDay,
        metadata: {
          ...(device.metadata || {}),
          isWorking:          editForm.isWorking,
          problemDescription: editForm.problemDescription,
          batteryHealth:      editForm.batteryHealth,
        },
      };
      const res = await updateDevice(id, payload);
      setDevice(res.data.data.device);
      setDc(res.data.data.deathClock);
      setEditing(false);
      toast.success('Device updated!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this device? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteDevice(id);
      toast.success('Device deleted');
      navigate('/devices');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10 MB'); return; }
    
    setPhotoUploading(true);
    setUploadProgress(0);
    
    // Simulate progress (in real scenario, axios onUploadProgress would be used)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);
    
    try {
      const res = await uploadDeviceImage(id, file);
      setUploadProgress(100);
      setDevice(d => ({
        ...d,
        metadata: { ...(d.metadata || {}), imageUrl: res.data.data.url },
      }));
      toast.success('Photo updated!');
    } catch { 
      toast.error('Upload failed'); 
    }
    finally { 
      clearInterval(progressInterval);
      setPhotoUploading(false); 
      setUploadProgress(0);
      e.target.value = ''; 
    }
  };

  const fetchAI = async () => {
    setLoadingAI(true);
    try {
      const res = await getAIRecommendations(id);
      setAiRec(res.data.data);
    } catch { toast.error('AI analysis failed'); }
    finally { setLoadingAI(false); }
  };

  if (loading) return <LoadingState size="lg" fullPage />;
  if (!device) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-700">Device not found</p>
      </div>
    </div>
  );

  const Icon = ICONS[device.category] || Smartphone;
  const sc   = STATUS_CONFIG[dc?.status] || STATUS_CONFIG.warning;
  const ringColor = dc?.healthScore >= 80 ? '#10b981' : dc?.healthScore >= 60 ? '#22c55e' : dc?.healthScore >= 40 ? '#f59e0b' : dc?.healthScore >= 20 ? '#ef4444' : '#6b7280';
  const autoAssessment = getAutoAssessment(dc);
  const imageUrl = device.metadata?.imageUrl;
  const isWorking = device.metadata?.isWorking !== false;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link to="/devices" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Devices
      </Link>

      {/* ── Header card ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        {editing ? (
          /* Edit form */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900 text-lg">Edit Device</h2>
              <div className="flex gap-2">
                <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  loading={saving}
                  size="sm"
                  icon={Save}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Device Name *</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={editForm.category} onChange={e => setEditForm(f => ({...f, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                <input value={editForm.brand} onChange={e => setEditForm(f => ({...f, brand: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
                <input value={editForm.model} onChange={e => setEditForm(f => ({...f, model: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                <select value={editForm.condition} onChange={e => setEditForm(f => ({...f, condition: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Usage (hrs/day)</label>
                <input type="number" min="0" max="24" step="0.5" value={editForm.usageHoursPerDay}
                  onChange={e => setEditForm(f => ({...f, usageHoursPerDay: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            {/* Working status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Working Status</label>
              <div className="flex gap-3">
                {[true, false].map(w => (
                  <button key={String(w)} type="button" onClick={() => setEditForm(f => ({...f, isWorking: w}))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      editForm.isWorking === w
                        ? w ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {w ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {w ? 'Working' : 'Not Working'}
                  </button>
                ))}
              </div>
            </div>

            {!editForm.isWorking && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Problem Description</label>
                <textarea value={editForm.problemDescription} onChange={e => setEditForm(f => ({...f, problemDescription: e.target.value}))}
                  rows={2} placeholder="Describe the issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Battery Health</label>
              <input value={editForm.batteryHealth} onChange={e => setEditForm(f => ({...f, batteryHealth: e.target.value}))}
                placeholder="e.g. 82% or 'Good'" maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        ) : (
          /* View mode */
          <>
            <div className="flex items-start gap-4 mb-6">
              {/* Device image / icon */}
              <div className="relative group flex-shrink-0">
                <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {imageUrl
                    ? <img src={imageUrl} alt={device.name} className="w-full h-full object-cover" />
                    : <Icon className="w-8 h-8 text-emerald-600" />}
                </div>
                <button 
                  onClick={() => photoInputRef.current?.click()} 
                  disabled={photoUploading}
                  aria-label="Upload device photo"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-emerald-700 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50">
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                
                {/* Progress indicator */}
                {photoUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="w-12">
                      <ProgressBar value={uploadProgress} max={100} size="sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${sc.bg} ${sc.text}`}>
                    {sc.label}
                  </span>
                  {!isWorking && (
                    <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Not Working
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{device.brand} {device.model} · {device.category?.replace('_',' ')}</p>
                {device.metadata?.batteryHealth && (
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" /> Battery: {device.metadata.batteryHealth}
                  </p>
                )}
                {device.metadata?.problemDescription && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" /> {device.metadata.problemDescription}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <Link
                  to={`/rescue?deviceId=${device.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find Best Future</span>
                </Link>
                <Button
                  onClick={startEdit}
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  loading={deleting}
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Delete device"
                />
              </div>
            </div>

            {/* Death Clock ring + stats */}
            {dc && (
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="7"
                      strokeLinecap="round" strokeDasharray={`${(dc.healthScore/100)*264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{dc.healthScore}%</span>
                    <span className="text-xs text-gray-500">Health Score</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-emerald-700">{dc.remainingDays}</div>
                    <div className="text-xs text-gray-500">Days Remaining</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-bold text-green-700">{dc.deathDate}</div>
                    <div className="text-xs text-gray-500">Predicted EOL</div>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-xl text-center">
                    <Activity className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-teal-700">{dc.ageInYears} yrs</div>
                    <div className="text-xs text-gray-500">Device Age</div>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-xl text-center">
                    <Info className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-cyan-700">{dc.adjustedLifespan} yrs</div>
                    <div className="text-xs text-gray-500">Adjusted Lifespan</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── E-Waste Assessment ───────────────────────────────── */}
      {!editing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">E-Waste Assessment</h2>
          <p className="text-sm text-gray-700 mb-4">
            Based on the device's health score, the recommended action is highlighted. You can also choose a different path.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ASSESSMENT_OPTIONS.map(opt => {
              const isAuto = opt.key === autoAssessment;
              return (
                <div key={opt.key}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all cursor-default ${
                    isAuto ? opt.color + ' shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}>
                  {isAuto && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                  <opt.icon className="w-5 h-5 mb-1.5 mt-1" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </div>
              );
            })}
          </div>

          {/* Action links based on assessment */}
          <div className="mt-4 flex flex-wrap gap-2">
            {autoAssessment === 'repair' && (
              <Link to="/repair" className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-200 flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Find Repair Provider
              </Link>
            )}
            {(autoAssessment === 'sell' || autoAssessment === 'donate' || autoAssessment === 'reuse') && (
              <Link to="/marketplace" className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> List on Marketplace
              </Link>
            )}
            {(autoAssessment === 'recycle' || autoAssessment === 'special_handling') && (
              <Link to="/map" className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200 flex items-center gap-2">
                <Recycle className="w-4 h-4" /> Find Recycling Point
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Factors ─────────────────────────────────────────── */}
      {!editing && dc?.factors?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Factors Affecting Lifespan</h2>
          <div className="space-y-2">
            {dc.factors.map(f => (
              <div key={f.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{f.name}</div>
                  <div className="text-xs text-gray-700">{f.description}</div>
                </div>
                <div className={`text-sm font-bold flex-shrink-0 ${f.impact > 0 ? 'text-emerald-600' : f.impact < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {f.impact > 0 ? '+' : ''}{f.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ─────────────────────────────────── */}
      {!editing && dc?.recommendations?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {dc.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Analysis ─────────────────────────────────────── */}
      {!editing && (
        <div className="bg-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-lg font-semibold">AI Recycling Recommendations</h2>
          </div>
          {aiRec ? (
            <>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {aiRec.recommendations}
              </div>
              <p className="text-xs text-emerald-200 mt-3">Powered by Gemini AI ({aiRec.model})</p>
            </>
          ) : (
            <Button
              onClick={fetchAI}
              disabled={loadingAI}
              loading={loadingAI}
              variant="ghost"
              icon={Sparkles}
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              {loadingAI ? 'Analysing...' : 'Get AI Recommendations'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
