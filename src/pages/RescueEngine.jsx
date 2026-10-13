import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck,
  CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Smartphone, Check, Eye,
  Share2, Download, Copy, Award, TrendingUp,
  Clock, Battery, Sliders, ChevronRight, Info, Camera,
  FileCheck, Trophy, MapPin, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Badge } from '../components/ui';
import useAuthStore from '../context/authStore';
import { getDevices, getDevice, updateDevice } from '../services/deviceService';
import {
  DEVICE_PRESETS,
  evaluateDeviceTruthReport,
  generateFuturesExchangeOffers,
  calculateBestRecommendation,
  generateProofOfRescue
} from '../services/rescueEngine';

const STEPS = [
  { id: 1, label: '1. Assess & Truth Report', sub: 'Model & verified condition' },
  { id: 2, label: '2. Futures Exchange', sub: '5 competing circular paths' },
  { id: 3, label: '3. Choose & Optimize', sub: 'Trade-offs & recommendation' },
  { id: 4, label: '4. Complete & Follow-Through', sub: 'Handover & Proof of Rescue' },
];

export default function RescueEngine() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [userDevices, setUserDevices] = useState([]);
  const [loadingUserDevices, setLoadingUserDevices] = useState(false);

  // Selected device setup
  const [deviceSource, setDeviceSource] = useState('preset'); // 'preset', 'user_device', 'custom'
  const [selectedPresetId, setSelectedPresetId] = useState(DEVICE_PRESETS[0].id);
  const [selectedUserDeviceId, setSelectedUserDeviceId] = useState('');
  
  // Custom device input form
  const [customDevice, setCustomDevice] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'smartphone',
    purchaseYear: 2022,
    originalMSRP: 45000,
    problemDescription: '',
    isWorking: true
  });

  // Diagnostic checks form
  const [diagnostics, setDiagnostics] = useState({
    batteryHealth: 76,
    batteryCycleCount: 940,
    batterySwollen: false,
    screenCondition: 'scratched', // 'flawless', 'scratched', 'cracked_usable', 'broken_display'
    bodyCondition: 'good', // 'mint', 'good', 'minor_scuffs', 'cracked_back', 'bent'
    camerasWorking: true,
    portsWorking: true,
    biometricsWorking: true,
    waterDamage: false,
    storageHealthy: true,
    isProInspected: false
  });

  // Photo evidence
  const [photoEvidence, setPhotoEvidence] = useState([
    { id: 'p1', label: 'Front Display', url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&auto=format&fit=crop&q=60' },
    { id: 'p2', label: 'Rear Housing', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60' }
  ]);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Privacy toggles for passport
  const [maskImei, setMaskImei] = useState(true);
  const [maskSerial, setMaskSerial] = useState(true);

  // Step 3 Preferences
  const [preferencePriority, setPreferencePriority] = useState('balanced'); // 'balanced', 'money', 'convenience', 'lifespan', 'environment'
  const [selectedOfferKey, setSelectedOfferKey] = useState(null);

  // Step 4 Handover & Booking state
  const [bookingForm, setBookingForm] = useState({
    serviceType: 'Doorstep Certified Courier Pickup',
    scheduledDate: 'Tomorrow, 10:00 AM - 1:00 PM',
    address: '14/B GreenTech Park, Sector 4, Bangalore',
    contactPhone: '+91 98765 43210',
    payoutMethod: 'Instant UPI / Direct Bank Transfer'
  });
  const [checklist, setChecklist] = useState({
    backedUp: true,
    signedOut: true,
    wiped: true,
    simRemoved: true
  });
  const [handoverStage, setHandoverStage] = useState('scheduled'); // 'scheduled', 'courier_dispatched', 'lab_inspected', 'completed'
  const [proofOfRescue, setProofOfRescue] = useState(null);

  // Diagnostic Test Screen Simulation Modal
  const [showScreenTestModal, setShowScreenTestModal] = useState(false);
  const [touchGridTested, setTouchGridTested] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showSavedRescuesModal, setShowSavedRescuesModal] = useState(false);
  const [savedRescues, setSavedRescues] = useState([]);

  // Fetch logged in user's devices and handle deviceId query param
  useEffect(() => {
    const deviceIdParam = searchParams.get('deviceId');
    if (user) {
      setLoadingUserDevices(true);
      getDevices()
        .then(res => {
          const items = res.data?.data?.items || res.data?.items || [];
          setUserDevices(items);
          if (items.length > 0 && deviceIdParam) {
            const matched = items.find(d => String(d.id) === String(deviceIdParam));
            if (matched) {
              setDeviceSource('user_device');
              setSelectedUserDeviceId(matched.id);
            }
          }
        })
        .catch(() => {
          // Fallback gracefully
        })
        .finally(() => setLoadingUserDevices(false));
    }

    // Direct lookup fallback if deviceId is passed and not yet populated
    if (deviceIdParam) {
      getDevice(deviceIdParam)
        .then(res => {
          const d = res.data?.data?.device || res.data?.device;
          if (d) {
            setDeviceSource('user_device');
            setSelectedUserDeviceId(d.id);
            setUserDevices(prev => {
              if (!prev.some(item => String(item.id) === String(d.id))) {
                return [d, ...prev];
              }
              return prev;
            });
          }
        })
        .catch(() => {
          // Direct fetch silent fallback
        });
    }
  }, [user, searchParams]);

  // Load saved rescues from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ecoloop_rescues') || '[]');
      setSavedRescues(stored);
    } catch {
      setSavedRescues([]);
    }
  }, []);

  // Update diagnostics when a preset changes
  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = DEVICE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setDiagnostics({
        ...preset.defaultDiagnostics,
        isProInspected: false
      });
    }
  };

  // Determine current active device metadata
  const currentDeviceInput = useMemo(() => {
    if (deviceSource === 'preset') {
      const preset = DEVICE_PRESETS.find(p => p.id === selectedPresetId) || DEVICE_PRESETS[0];
      return {
        brand: preset.brand,
        model: preset.model,
        name: preset.name,
        category: preset.category,
        purchaseYear: preset.releaseYear,
        originalMSRP: preset.originalMSRP,
        typicalIssue: preset.typicalIssue,
        isWorking: true,
        specs: preset.specs
      };
    } else if (deviceSource === 'user_device') {
      const found = userDevices.find(d => String(d.id) === String(selectedUserDeviceId));
      if (found) {
        return {
          brand: found.brand || 'Personal Device',
          model: found.model || found.name,
          name: found.name,
          category: found.category || 'smartphone',
          purchaseYear: found.purchaseDate ? new Date(found.purchaseDate).getFullYear() : 2022,
          originalMSRP: found.purchasePrice || 50000,
          typicalIssue: found.metadata?.problemDescription || 'User saved device',
          isWorking: found.metadata?.isWorking !== false,
          id: found.id
        };
      }
    }
    return {
      brand: customDevice.brand || 'Custom Device',
      model: customDevice.model || 'Model X',
      name: customDevice.name || `${customDevice.brand} ${customDevice.model}`,
      category: customDevice.category,
      purchaseYear: Number(customDevice.purchaseYear) || 2022,
      originalMSRP: Number(customDevice.originalMSRP) || 45000,
      typicalIssue: customDevice.problemDescription || 'Standard hardware evaluation',
      isWorking: customDevice.isWorking
    };
  }, [deviceSource, selectedPresetId, selectedUserDeviceId, userDevices, customDevice]);

  // Generate Truth Report
  const truthReport = useMemo(() => {
    return evaluateDeviceTruthReport(currentDeviceInput, diagnostics, photoEvidence);
  }, [currentDeviceInput, diagnostics, photoEvidence]);

  // Generate Futures Exchange Offers
  const exchangeOffers = useMemo(() => {
    return generateFuturesExchangeOffers(truthReport);
  }, [truthReport]);

  // Generate Multi-criteria recommendation
  const recommendation = useMemo(() => {
    return calculateBestRecommendation(exchangeOffers, preferencePriority);
  }, [exchangeOffers, preferencePriority]);

  // Selected offer object
  const activeSelectedOffer = useMemo(() => {
    if (selectedOfferKey) {
      return exchangeOffers.find(o => o.key === selectedOfferKey) || recommendation?.topChoice;
    }
    return recommendation?.topChoice || exchangeOffers[0];
  }, [selectedOfferKey, exchangeOffers, recommendation]);

  // Simulate file upload
  const handleSimulatePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setTimeout(() => {
      const newPhoto = {
        id: 'p-' + Date.now(),
        label: `Evidence Photo ${photoEvidence.length + 1}`,
        url: URL.createObjectURL(file)
      };
      setPhotoEvidence(prev => [...prev, newPhoto]);
      setPhotoUploading(false);
      toast.success('Evidence photo uploaded to Device Truth Report!');
    }, 700);
  };

  // Run screen touch test simulation
  const handleCompleteScreenTest = () => {
    setTouchGridTested(true);
    setShowScreenTestModal(false);
    toast.success('Digitizer responsiveness & subpixel probe verified (0 dead zones)');
  };

  // Complete simulated handover and generate Proof of Rescue
  const handleSimulateHandover = async () => {
    setHandoverStage('completed');
    const proof = generateProofOfRescue(activeSelectedOffer, truthReport, bookingForm);
    setProofOfRescue(proof);
    setSavedRescues(prev => [proof, ...prev]);

    // Step 4 follow-through: Update device record in backend/database if this is a registered user device
    if (currentDeviceInput?.id) {
      try {
        await updateDevice(currentDeviceInput.id, {
          status: 'recycled',
          metadata: {
            rescueId: proof.rescueId,
            passportId: truthReport.passport?.passportId,
            chosenPathway: activeSelectedOffer.key,
            truthConfidence: truthReport.truthConfidencePercent,
            truthTier: truthReport.truthTier,
            verifiedAt: proof.verifiedAt
          }
        });
        toast.success('Device record updated in your circular inventory!');
      } catch (err) {
        console.warn('Could not update device record remotely, saved locally', err);
      }
    }

    toast.success('Device Rescue verified & official Proof of Rescue issued!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* ── Top Header Banner ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-700 shadow-lg relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  EcoLoop Signature Experience
                </span>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Unbiased Decision Engine
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Find Your Device's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">Best Future</span>.
              </h1>
              <p className="mt-2.5 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                One assessment. Five competing circular pathways. Transparent quotes and follow-through follow each device until its ideal outcome is achieved.
              </p>
            </div>

            {/* Header Action Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {savedRescues.length > 0 && (
                <button
                  onClick={() => setShowSavedRescuesModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>My Rescues ({savedRescues.length})</span>
                </button>
              )}
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Sponsor Kickbacks</span>
              </div>
            </div>
          </div>

          {/* ── Step Progress Indicator ─────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-900/30 ring-1 ring-emerald-500'
                        : isPassed
                        ? 'bg-slate-800/80 border-slate-600 text-slate-300 hover:border-slate-500'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold uppercase tracking-wider ${isActive ? 'text-emerald-400' : isPassed ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-300/80 mt-0.5 truncate">
                      {step.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Wizard Main Body ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* ══════════════════════════════════════════════════════════════════
            STEP 1: ASSESS & DEVICE TRUTH REPORT
           ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            
            {/* Device Source Picker Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>Select Electronic Device to Assess</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose from benchmark presets, your saved inventory, or input a custom unit.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setDeviceSource('preset')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      deviceSource === 'preset' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Presets
                  </button>
                  {user && (
                    <button
                      onClick={() => setDeviceSource('user_device')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        deviceSource === 'user_device' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      My Devices ({userDevices.length})
                    </button>
                  )}
                  <button
                    onClick={() => setDeviceSource('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      deviceSource === 'custom' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Custom Device
                  </button>
                </div>
              </div>

              {/* Source 1: Presets grid */}
              {deviceSource === 'preset' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {DEVICE_PRESETS.map((preset) => {
                    const selected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          selected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {preset.category}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">{preset.releaseYear}</span>
                          </div>
                          <div className="font-extrabold text-xs text-slate-900 line-clamp-1">{preset.name}</div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.typicalIssue}</div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Orig MSRP:</span>
                          <span className="font-bold text-slate-700">₹{preset.originalMSRP.toLocaleString('en-IN')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Source 2: User Devices */}
              {deviceSource === 'user_device' && (
                <div>
                  {loadingUserDevices ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading your devices...</div>
                  ) : userDevices.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-sm font-semibold text-slate-700">No registered devices found in your account.</p>
                      <button
                        onClick={() => setDeviceSource('preset')}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Select a popular hardware preset instead
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {userDevices.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedUserDeviceId(d.id)}
                          className={`text-left p-3.5 rounded-xl border transition-all ${
                            selectedUserDeviceId === d.id
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-bold text-sm text-slate-900">{d.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{d.brand} {d.model}</div>
                          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
                            Health score: {d.deathClock?.healthScore || 75}%
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Source 3: Custom Device form */}
              {deviceSource === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  <Input
                    label="Brand"
                    placeholder="e.g. Sony, OnePlus, Asus"
                    value={customDevice.brand}
                    onChange={(e) => setCustomDevice({ ...customDevice, brand: e.target.value })}
                  />
                  <Input
                    label="Model Name"
                    placeholder="e.g. WH-1000XM4, Nord 2T"
                    value={customDevice.model}
                    onChange={(e) => setCustomDevice({ ...customDevice, model: e.target.value })}
                  />
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Category</label>
                    <select
                      value={customDevice.category}
                      onChange={(e) => setCustomDevice({ ...customDevice, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="smartphone">Smartphone</option>
                      <option value="laptop">Laptop</option>
                      <option value="tablet">Tablet</option>
                      <option value="audio">Audio / Wearables</option>
                      <option value="tv">Display / TV</option>
                      <option value="other">Other Hardware</option>
                    </select>
                  </div>
                  <Input
                    label="Purchase Year"
                    type="number"
                    value={customDevice.purchaseYear}
                    onChange={(e) => setCustomDevice({ ...customDevice, purchaseYear: e.target.value })}
                  />
                  <Input
                    label="Original MSRP (₹)"
                    type="number"
                    value={customDevice.originalMSRP}
                    onChange={(e) => setCustomDevice({ ...customDevice, originalMSRP: e.target.value })}
                  />
                  <Input
                    label="Known Issues / Symptoms"
                    placeholder="e.g. degraded battery, broken glass"
                    value={customDevice.problemDescription}
                    onChange={(e) => setCustomDevice({ ...customDevice, problemDescription: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* ── Interactive Diagnostics & Truth Verification ───────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Col 1 & 2: Guided Evidence Checks */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" />
                        <span>Guided Diagnostic Evidence Checks</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        These checks establish evidence to eliminate fraud and unlock guaranteed price locks.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowScreenTestModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{touchGridTested ? 'Digitizer Checked ✓' : 'Run Screen Probe'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Battery Wear Slider */}
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Battery className="w-4 h-4 text-emerald-600" />
                          <span>Battery Health Capacity Telemetry</span>
                        </label>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          diagnostics.batteryHealth >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          diagnostics.batteryHealth >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {diagnostics.batteryHealth}% · {diagnostics.batteryHealth >= 80 ? 'Normal Peak' : diagnostics.batteryHealth >= 65 ? 'Degraded' : 'Service Required'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={diagnostics.batteryHealth}
                        onChange={(e) => setDiagnostics({ ...diagnostics, batteryHealth: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>30% (Critical)</span>
                        <span>Estimated Cycle Count: ~{diagnostics.batteryCycleCount || 850} cycles</span>
                        <span>100% (Pristine)</span>
                      </div>
                    </div>

                    {/* Screen Glass & Matrix Condition */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Screen Glass & OLED / LCD Matrix State
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'flawless', label: 'Flawless', desc: 'Zero scratches or dead pixels' },
                          { id: 'scratched', label: 'Micro-Scratches', desc: 'Normal pocket wear' },
                          { id: 'cracked_usable', label: 'Cracked Glass', desc: 'Display works underneath' },
                          { id: 'broken_display', label: 'Broken Matrix', desc: 'OLED lines or black bleed' }
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setDiagnostics({ ...diagnostics, screenCondition: s.id })}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              diagnostics.screenCondition === s.id
                                ? 'bg-emerald-50 border-emerald-500 font-bold ring-1 ring-emerald-500 text-emerald-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{s.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enclosure / Body Condition */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Chassis & Enclosure Exterior
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'mint', label: 'Like New Mint', desc: 'No dings or marks' },
                          { id: 'good', label: 'Good Daily', desc: 'Minor corner scuffs' },
                          { id: 'cracked_back', label: 'Cracked Back', desc: 'Rear glass panel cracked' },
                          { id: 'bent', label: 'Bent / Warped', desc: 'Frame structural damage' }
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setDiagnostics({ ...diagnostics, bodyCondition: b.id })}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              diagnostics.bodyCondition === b.id
                                ? 'bg-emerald-50 border-emerald-500 font-bold ring-1 ring-emerald-500 text-emerald-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{b.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subsystem Toggles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, camerasWorking: !diagnostics.camerasWorking })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          diagnostics.camerasWorking ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <span>Camera Array</span>
                        <span>{diagnostics.camerasWorking ? 'Working ✓' : 'Faulty ✗'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, portsWorking: !diagnostics.portsWorking })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          diagnostics.portsWorking ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <span>Charge Port & Mic</span>
                        <span>{diagnostics.portsWorking ? 'Clean ✓' : 'Faulty ✗'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, biometricsWorking: !diagnostics.biometricsWorking })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          diagnostics.biometricsWorking ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <span>Biometrics & Sensors</span>
                        <span>{diagnostics.biometricsWorking ? 'Passed ✓' : 'Failed ✗'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, storageHealthy: !diagnostics.storageHealthy })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          diagnostics.storageHealthy ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <span>Flash NAND / SMART</span>
                        <span>{diagnostics.storageHealthy ? 'Healthy ✓' : 'Bad Blocks ✗'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, waterDamage: !diagnostics.waterDamage })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          !diagnostics.waterDamage ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <span>Liquid Indicator (LDI)</span>
                        <span>{!diagnostics.waterDamage ? 'Clean ✓' : 'Triggered (LDI) ✗'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDiagnostics({ ...diagnostics, batterySwollen: !diagnostics.batterySwollen })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          !diagnostics.batterySwollen ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                        }`}
                      >
                        <span>Battery Swelling</span>
                        <span>{!diagnostics.batterySwollen ? 'Normal ✓' : 'Swollen ⚠️'}</span>
                      </button>
                    </div>

                    {/* Photo Evidence Upload Box */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>Photo Condition Evidence ({photoEvidence.length} attached)</span>
                        </label>
                        <label className={`cursor-pointer text-xs font-bold flex items-center gap-1 ${photoUploading ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-700'}`}>
                          <span>{photoUploading ? 'Uploading Evidence...' : '+ Add Photo Evidence'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={photoUploading}
                            className="hidden"
                            onChange={handleSimulatePhotoUpload}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {photoEvidence.map((photo, idx) => (
                          <div key={photo.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                            <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-1 text-[10px] text-white font-medium truncate text-center">
                              {photo.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: The Live Device Truth Report Card */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm sticky top-20">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Device Truth Report
                    </span>
                    <button
                      onClick={() => setShowPassportModal(true)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Device Passport</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-300 font-medium">Evidence Confidence:</span>
                      <span className="text-base font-black text-emerald-400 font-display">
                        {truthReport.truthConfidencePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500"
                        style={{ width: `${truthReport.truthConfidencePercent}%` }}
                      />
                    </div>
                    <div className="mt-2.5 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{truthReport.truthTier}</span>
                    </div>
                  </div>

                  {/* Evidence Tiers Breakdown */}
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                        <span>1. User Reported Claims</span>
                        <span className="text-[10px] text-slate-500">Stated</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {truthReport.userClaims[1]?.claim || 'General aging'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                        <span>2. Automated Diagnostic Checks</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Verified by API</span>
                      </div>
                      <div className="space-y-1">
                        {truthReport.automatedChecks.slice(0, 3).map((check, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="truncate">{check.check}:</span>
                            <span className={`font-semibold ${check.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {check.passed ? 'Passed ✓' : 'Action Req'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                        <span>3. Professional Physical Inspection</span>
                        <span className="text-[10px] text-slate-400">At Handover</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Guarantees fraud protection for both buyer and seller upon physical intake.
                      </div>
                    </div>
                  </div>

                  {/* Transferable Passport ID Stamp */}
                  <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                      Transferable Passport ID
                    </div>
                    <div className="font-mono text-xs font-black tracking-wide text-emerald-900 mt-0.5 truncate">
                      {truthReport.passport.passportId}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-1 flex items-center justify-between">
                      <span>Privacy Shield: IMEI & Serial Masked</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>

                  {/* Critical Hazard Alert if Swollen or Severe Danger */}
                  {truthReport.hasHazard && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Hazard Protocol Active</span>
                      </div>
                      <div className="text-[11px] mt-1 text-red-700 leading-snug">
                        {truthReport.hazardWarning}
                      </div>
                    </div>
                  )}

                  {/* Missing Data & Uncertainty Disclosures */}
                  {truthReport.missingDataDisclosures && truthReport.missingDataDisclosures.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-600" />
                        <span>Missing Data Disclosures</span>
                      </div>
                      <ul className="mt-1 space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                        {truthReport.missingDataDisclosures.map((disc, idx) => (
                          <li key={idx} className="leading-tight">{disc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next CTA */}
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full mt-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Solicit Futures Exchange Quotes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2: COMPARE & THE DEVICE FUTURES EXCHANGE
           ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            
            {/* Header / Intro Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>The Device Futures Exchange</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    5 Competing Pathways
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Verified providers compete for <strong>{truthReport.deviceInput.name}</strong> based on your Truth Report evidence. Review certified quotes, warranties, turnaround times, and carbon savings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Diagnostics</span>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <span>Rank by My Priorities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5 Competing Pathway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {exchangeOffers.map((offer) => {
                const isSelected = (selectedOfferKey || recommendation.topChoice.key) === offer.key;
                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                          {offer.badge}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          ★ {offer.provider.rating} ({offer.provider.reviewsCount})
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {offer.tagline}
                      </p>

                      {/* Provider info */}
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                        <div className="font-bold text-slate-800">{offer.provider.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{offer.provider.turnaround}</div>
                      </div>

                      {/* Financial Figure */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {offer.financial.type === 'cost' ? 'Investment Required' : 'Net Cash Returned'}
                        </div>
                        <div className="text-xl font-black font-display text-emerald-400 mt-0.5">
                          {offer.financial.displayAmount}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          {offer.financial.explanation}
                        </div>
                      </div>

                      {/* Key metrics grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase">CO2e Prevented</div>
                          <div className="font-extrabold text-xs mt-0.5">~{offer.environmentalImpact.co2SavedKg} kg</div>
                        </div>
                        <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900">
                          <div className="text-[10px] font-bold text-blue-700 uppercase">Lifespan Added</div>
                          <div className="font-extrabold text-xs mt-0.5">+{offer.lifespanMonths} Months</div>
                        </div>
                      </div>

                      {/* Included services */}
                      <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                        {offer.includedServices.slice(0, 2).map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{s}</span>
                          </div>
                        ))}
                      </div>

                      {/* Confidence / Variance disclosure */}
                      <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Confidence: {offer.confidenceScore}</span>
                        <span className="font-mono text-slate-500">{offer.confidenceVariance}</span>
                      </div>
                    </div>

                    {/* Choose button */}
                    <button
                      onClick={() => {
                        setSelectedOfferKey(offer.key);
                        setCurrentStep(3);
                      }}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Selected Pathway ✓' : 'Select Pathway'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Direct Comparison Matrix Table */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm overflow-x-auto">
              <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <span>Side-by-Side Trade-Off Matrix</span>
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 pr-4">Pathway</th>
                    <th className="py-2.5 px-4">Financial Outcome</th>
                    <th className="py-2.5 px-4">Turnaround</th>
                    <th className="py-2.5 px-4">Warranty</th>
                    <th className="py-2.5 px-4">Carbon Prevented</th>
                    <th className="py-2.5 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {exchangeOffers.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pr-4 font-bold text-slate-900">
                        {o.title}
                        <div className="text-[10px] text-slate-400 font-normal">{o.provider.name}</div>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700 font-display">
                        {o.financial.displayAmount}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{o.provider.turnaround.split('(')[0]}</td>
                      <td className="py-3 px-4 text-slate-600">{o.warranty.split(' ')[0]} {o.warranty.split(' ')[1]}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">~{o.environmentalImpact.co2SavedKg} kg CO2e</td>
                      <td className="py-3 pl-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOfferKey(o.key);
                            setCurrentStep(3);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px]"
                        >
                          Choose
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3: CHOOSE & SMART RECOMMENDATION ENGINE
           ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            
            {/* Preference Priority Selector */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
              <div className="max-w-3xl">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>What Do You Value Most for This Device?</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  EcoLoop recommends options according to what <strong>you</strong> prioritize—never which partner pays the app the highest affiliate kickback.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
                {[
                  { id: 'balanced', label: 'Balanced All-Round', icon: '⚖️', desc: 'Harmonious composite score' },
                  { id: 'money', label: 'Maximize Money', icon: '💰', desc: 'Highest net cash payout' },
                  { id: 'convenience', label: 'Max Convenience', icon: '⚡', desc: 'Fastest doorstep pickup' },
                  { id: 'lifespan', label: 'Extend Lifespan', icon: '⏳', desc: 'Keep hardware in use longest' },
                  { id: 'environment', label: 'Eco Impact', icon: '🌿', desc: 'Max carbon & metal conserved' },
                ].map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => setPreferencePriority(pref.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      preferencePriority === pref.id
                        ? 'bg-emerald-900 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-lg mb-1">{pref.icon}</div>
                    <div className="text-xs font-extrabold">{pref.label}</div>
                    <div className={`text-[10px] mt-0.5 ${preferencePriority === pref.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {pref.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Highlight Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/40 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      EcoLoop Recommended Future
                    </span>
                    <span className="text-xs text-slate-400">
                      Optimized for: <strong>{preferencePriority.toUpperCase()}</strong>
                    </span>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 font-bold bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                    Match Score: {recommendation.topChoice.scores.composite}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                      {recommendation.topChoice.title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {recommendation.topChoice.recommendationRationale}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">Why this pathway wins: </span>
                      {recommendation.topChoice.financial.explanation}
                    </div>

                    {/* Breakdown pill row */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-700 text-emerald-200">
                        Financial: <strong className="text-white">{recommendation.topChoice.financial.displayAmount}</strong>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        Provider: <strong className="text-white">{recommendation.topChoice.provider.name}</strong>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        CO2 Avoided: <strong className="text-emerald-400">~{recommendation.topChoice.environmentalImpact.co2SavedKg} kg</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-bold">Selected Provider</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">{recommendation.topChoice.provider.name}</div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5">★ {recommendation.topChoice.provider.rating} Verified Partner</div>
                      <div className="text-xs text-slate-400 mt-2">{recommendation.topChoice.provider.turnaround}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOfferKey(recommendation.topChoice.key);
                        setCurrentStep(4);
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Proceed with This Future</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Independent Disclosure Footnote */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{recommendation.independentDisclosure}</span>
                  </div>
                  {recommendation.uncertaintyDisclosures && recommendation.uncertaintyDisclosures.length > 0 && (
                    <div className="text-[10px] text-slate-400 pl-6">
                      <span className="font-semibold text-slate-300">Estimates & Uncertainty: </span>
                      {recommendation.uncertaintyDisclosures.join(' ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Runner-Up Alternative Option */}
            {recommendation.runnerUp && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-500">Runner-Up Alternative Pathway</div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{recommendation.runnerUp.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">{recommendation.runnerUp.tagline}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-700">{recommendation.runnerUp.financial.displayAmount}</div>
                    <div className="text-[10px] text-slate-400">Score: {recommendation.runnerUp.scores.composite}/100</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOfferKey(recommendation.runnerUp.key);
                      setCurrentStep(4);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Switch to This Option
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4: COMPLETE & PROOF OF RESCUE (FOLLOW-THROUGH)
           ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            
            {/* Handover & Booking Tracker Header */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>Follow-Through & Handover Tracking</span>
                  </h2>
                  <Badge variant={handoverStage === 'completed' ? 'success' : 'brand'}>
                    {handoverStage === 'completed' ? 'Rescue Verified ✓' : 'Handover In Progress'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Following through on <strong>{activeSelectedOffer.title}</strong> for <strong>{truthReport.deviceInput.name}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  Change Pathway
                </button>
                {handoverStage !== 'completed' && (
                  <button
                    onClick={handleSimulateHandover}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simulate Verification & Complete</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4-Stage Lifecycle Handover Pipeline */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">
                Real-Time Chain of Custody & Verification Pipeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { stage: 'scheduled', label: '1. Handover Scheduled', sub: 'Courier assigned · Box issued', active: true },
                  { stage: 'courier_dispatched', label: '2. Express Pickup', sub: 'Physical device collected', active: handoverStage !== 'scheduled' },
                  { stage: 'lab_inspected', label: '3. Diagnostic Verification', sub: 'Hardware matches Truth Report', active: handoverStage === 'lab_inspected' || handoverStage === 'completed' },
                  { stage: 'completed', label: '4. Outcome Fulfilled', sub: 'Payout / repair done & Proof issued', active: handoverStage === 'completed' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      s.active
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{s.label}</span>
                      {s.active ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Split: Checklist + Handover Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Owner Pre-Handover Checklist */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Device Pre-Handover Checklist</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Complete these steps before handover to protect personal privacy and ensure instant payout.
                </p>

                <div className="space-y-3">
                  {[
                    { key: 'backedUp', label: 'Back up photos and cloud storage accounts' },
                    { key: 'signedOut', label: 'Sign out of Apple ID / Google Account & disable Find My' },
                    { key: 'wiped', label: 'Perform factory reset (Certified DoD sanitization also done on-site)' },
                    { key: 'simRemoved', label: 'Remove physical SIM card and any micro-SD cards' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => setChecklist({ ...checklist, [item.key]: !checklist[item.key] })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Handover logistics form */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Pickup Logistics & Payout Routing</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Certified courier will perform identity and Truth Report check on-site.
                </p>

                <div className="space-y-3">
                  <Input
                    label="Service Delivery Mode"
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  />
                  <Input
                    label="Scheduled Slot"
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                  />
                  <Input
                    label="Doorstep Address"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                  />
                  <Input
                    label="Payout Destination"
                    value={bookingForm.payoutMethod}
                    onChange={(e) => setBookingForm({ ...bookingForm, payoutMethod: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ── THE PROOF OF RESCUE REPORT (OFFICIAL CERTIFICATE) ──────── */}
            {proofOfRescue && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  
                  {/* Certificate Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                          Official Verifiable Outcome
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                          Proof of Rescue™ Certificate
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-400">Certificate ID:</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">{proofOfRescue.rescueId}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{proofOfRescue.verifiedAt}</div>
                    </div>
                  </div>

                  {/* Device and Outcome Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <div className="text-xs text-slate-400 uppercase font-bold">Rescued Hardware</div>
                      <div className="text-base font-extrabold text-white mt-1">{proofOfRescue.device.model}</div>
                      <div className="text-xs text-emerald-400 font-mono mt-0.5">{proofOfRescue.device.passportId}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <div className="text-xs text-slate-400 uppercase font-bold">Executed Future</div>
                      <div className="text-base font-extrabold text-white mt-1">{proofOfRescue.chosenPathway.title}</div>
                      <div className="text-xs text-slate-300 mt-0.5">Partner: {proofOfRescue.chosenPathway.partner}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/70">
                      <div className="text-xs text-emerald-300 uppercase font-bold">Verified Financial Outcome</div>
                      <div className="text-xl font-black text-emerald-300 font-display mt-0.5">
                        {proofOfRescue.chosenPathway.financialOutcome}
                      </div>
                      <div className="text-[11px] text-emerald-200/80 mt-0.5">Warranty: {proofOfRescue.chosenPathway.warranty}</div>
                    </div>
                  </div>

                  {/* Tangible Environmental Impact Metrics */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 mb-3">
                      Verified Material & Emissions Benefits
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900/80">
                        <div className="text-2xl font-black text-white font-display">
                          {proofOfRescue.verifiedMetrics.co2AvoidedKg} kg
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">CO2e Emissions Prevented</div>
                        <div className="text-[10px] text-emerald-400 mt-1">
                          ≈ {proofOfRescue.verifiedMetrics.equivalents.treesEquivalent} Mature Trees / Year
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80">
                        <div className="text-2xl font-black text-white font-display">
                          {proofOfRescue.verifiedMetrics.ewasteDivertedKg} kg
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">E-Waste Landfill Diverted</div>
                        <div className="text-[10px] text-emerald-400 mt-1">100% Circular Recovery</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80">
                        <div className="text-2xl font-black text-white font-display">
                          {proofOfRescue.verifiedMetrics.copperGrams} g
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Industrial Copper Conserved</div>
                        <div className="text-[10px] text-emerald-400 mt-1">Zero Mining Footprint</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80">
                        <div className="text-2xl font-black text-white font-display">
                          {proofOfRescue.verifiedMetrics.goldMg} mg
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Refined Gold Salvaged</div>
                        <div className="text-[10px] text-emerald-400 mt-1">Critical Tech Mineral</div>
                      </div>
                    </div>
                  </div>

                  {/* Community Device Rescue Challenge Callout */}
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-300">
                          {proofOfRescue.communityChallenge.challengeName}
                        </div>
                        <div className="text-xs text-white font-semibold">
                          Earned +{proofOfRescue.communityChallenge.leaderboardContributionPoints} Points for Your Community Leaderboard!
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {proofOfRescue.communityChallenge.badgeUnlocked}
                    </span>
                  </div>

                  {/* Certificate Verification Stamp & Share Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verification Hash: {proofOfRescue.verificationHash}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://ecoloop.social/proof/${proofOfRescue.rescueId}`);
                          toast.success('Certificate verification link copied to clipboard!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      <Link
                        to="/community"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share on EcoLoop Feed</span>
                      </Link>

                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setProofOfRescue(null);
                          setHandoverStage('scheduled');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Assess Another Device</span>
                      </button>

                      <Link
                        to="/dashboard"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Dashboard →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODAL: Screen Test Probe Simulation ───────────────────────── */}
      <Modal
        isOpen={showScreenTestModal}
        onClose={() => setShowScreenTestModal(false)}
        title="Interactive Screen & Digitizer Hardware Probe"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Click across the grid to simulate responsive subpixel digitizer checking and detect burn-in or phantom touch.
          </p>
          <div className="grid grid-cols-6 gap-1 p-3 bg-slate-900 rounded-2xl aspect-video items-center">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-8 rounded-md bg-emerald-500/20 hover:bg-emerald-400 border border-emerald-500/40 cursor-pointer transition-colors flex items-center justify-center text-[10px] text-emerald-300 font-mono"
              >
                ✓
              </div>
            ))}
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span>24/24 touch zones responsive · 0 dead pixels</span>
            <span className="font-bold">Score: 100%</span>
          </div>
          <Button variant="primary" fullWidth onClick={handleCompleteScreenTest}>
            Confirm Screen Probe Results
          </Button>
        </div>
      </Modal>

      {/* ── MODAL: Transferable Device Passport ────────────────────────── */}
      <Modal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
        title="Transferable Device Passport"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {truthReport.passport.passportId}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Transferable
              </span>
            </div>
            <div className="text-sm font-black">{truthReport.deviceInput.name}</div>
            <div className="text-xs text-slate-400">
              Manufacture Year: {truthReport.deviceInput.purchaseYear} · Category: {truthReport.deviceInput.category}
            </div>
            
            {/* Dynamic Masked Telemetry Attributes */}
            <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">IMEI Number:</span>
                <span className="font-bold text-emerald-400">{maskImei ? '356891********4' : '356891048291044'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Serial Identifier:</span>
                <span className="font-bold text-emerald-400">{maskSerial ? 'F2LYZ******9' : 'F2LYZK82MD9'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Ownership Privacy:</span>
                <span className="font-bold text-slate-300">Zero PII Leakage Active</span>
              </div>
            </div>

            {/* Privacy controls */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Mask IMEI Number in Passport:</span>
                <input
                  type="checkbox"
                  checked={maskImei}
                  onChange={() => setMaskImei(!maskImei)}
                  className="rounded text-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Mask Hardware Serial Number:</span>
                <input
                  type="checkbox"
                  checked={maskSerial}
                  onChange={() => setMaskSerial(!maskSerial)}
                  className="rounded text-emerald-500"
                />
              </label>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            This passport stays with the hardware across future sales, repairs, and recycling events with cryptographic privacy protection.
          </p>

          <Button variant="secondary" fullWidth onClick={() => setShowPassportModal(false)}>
            Close Passport
          </Button>
        </div>
      </Modal>

      {/* ── MODAL: Past Saved Rescues ─────────────────────────────────── */}
      <Modal
        isOpen={showSavedRescuesModal}
        onClose={() => setShowSavedRescuesModal(false)}
        title="Your Saved Device Rescue Records"
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {savedRescues.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No past rescues recorded yet.</div>
          ) : (
            savedRescues.map((rescue, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-emerald-700 font-bold">{rescue.rescueId}</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{rescue.device.model}</div>
                  <div className="text-xs text-slate-500">{rescue.chosenPathway.title} · {rescue.verifiedAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-700">{rescue.chosenPathway.financialOutcome}</div>
                  <div className="text-[11px] text-slate-400">~{rescue.verifiedMetrics.co2AvoidedKg} kg CO2e</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

    </div>
  );
}
