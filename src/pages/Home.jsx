import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Recycle, Wrench, Trophy, Zap, Heart,
  Package, Sparkles, Shield, Star, ChevronDown, CheckCircle2,
  Cpu, Smartphone, Laptop, Tv, Battery, RefreshCw,
  Globe, ShieldCheck, Gift, Check, Leaf, Award, TrendingUp,
  SlidersHorizontal, CheckCircle
} from 'lucide-react';
import { getPlatformImpact } from '../services/communityService';
import { Badge } from '../components/ui';

// ── Interactive Hardware Presets ────────────────────────────────────
const HARDWARE_PRESETS = [
  {
    id: 'smartphone',
    name: 'Flagship Smartphone',
    sub: 'iPhone 15 / Galaxy S24',
    icon: Smartphone,
    baseValue: 4800000,
    co2: 68,
    copper: 18,
    gold: 0.038,
    bestAction: 'sell',
    status: 'High resale demand'
  },
  {
    id: 'laptop',
    name: 'Performance Laptop',
    sub: 'MacBook Pro / ThinkPad',
    icon: Laptop,
    baseValue: 8500000,
    co2: 210,
    copper: 145,
    gold: 0.28,
    bestAction: 'repair',
    status: 'Component repair recommended'
  },
  {
    id: 'tv',
    name: '4K OLED Display',
    sub: '55" - 65" Smart Panels',
    icon: Tv,
    baseValue: 3200000,
    co2: 185,
    copper: 580,
    gold: 0.09,
    bestAction: 'repair',
    status: 'Panel salvageable'
  },
  {
    id: 'appliance',
    name: 'Inverter Appliance',
    sub: 'Smart AC / Inverter Compressor',
    icon: Cpu,
    baseValue: 1950000,
    co2: 380,
    copper: 1450,
    gold: 0.03,
    bestAction: 'recycle',
    status: 'High industrial copper yield'
  },
  {
    id: 'battery',
    name: 'Battery Cell Pack',
    sub: 'UPS / Lithium Power Storage',
    icon: Battery,
    baseValue: 650000,
    co2: 45,
    copper: 120,
    gold: 0.015,
    bestAction: 'recycle',
    status: 'Requires certified disposal'
  }
];

const CONDITIONS = [
  { id: 'pristine', label: 'Like New', mult: 1.0, desc: 'Pristine, 100% functional, no cosmetic marks' },
  { id: 'good', label: 'Good Working', mult: 0.75, desc: 'Normal wear, all subsystems verified' },
  { id: 'degraded', label: 'Needs Repair', mult: 0.45, desc: 'Cracked glass, weak battery, or ports' },
  { id: 'salvage', label: 'Scrap / Salvage', mult: 0.18, desc: 'Unresponsive, suitable for precious metals' }
];

const CIRCULAR_PATHS = [
  {
    id: 'repair',
    title: 'Certified Repair Network',
    badge: 'Hardware Revival',
    icon: Wrench,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    desc: 'Connect with 120+ vetted diagnostic repair centers with transparent price locks and warranty.',
    stats: '12,647 repairs completed',
    link: '/repair',
    actionText: 'Find Repair Shop'
  },
  {
    id: 'sell',
    title: 'Verified P2P Marketplace',
    badge: 'Fair Market Value',
    icon: Package,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    desc: 'List working gadgets and salvage components directly to verified buyers with escrow protection.',
    stats: 'IDR 4.2B+ traded',
    link: '/marketplace?circularAction=sell',
    actionText: 'Browse Marketplace'
  },
  {
    id: 'giveaway',
    title: 'Community Tech Giveaways',
    badge: 'Zero Cost Transfer',
    icon: Gift,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    desc: 'Pass functional tech to students, makers, and hobbyists who need hardware without financial barriers.',
    stats: '3,850+ gadgets gifted',
    link: '/marketplace?circularAction=give_away',
    actionText: 'Explore Free Tech'
  },
  {
    id: 'donate',
    title: 'School & NGO Donations',
    badge: 'Social Impact',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    desc: 'Donate decommissioned corporate or personal laptops to vocational schools and rural tech education programs.',
    stats: '54 schools equipped',
    link: '/marketplace?circularAction=donate',
    actionText: 'Support Schools'
  },
  {
    id: 'reuse',
    title: 'Component Salvage & Swap',
    badge: 'Parts Exchange',
    icon: RefreshCw,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    desc: 'Rescue memory modules, display panels, heatsinks, and logic boards to keep existing machines functioning.',
    stats: '18,200 parts harvested',
    link: '/marketplace?circularAction=reuse',
    actionText: 'Find Spare Parts'
  },
  {
    id: 'recycle',
    title: '250+ Licensed Waste Banks',
    badge: 'Certified Safe Disposal',
    icon: Recycle,
    color: 'green',
    gradient: 'from-emerald-600 to-green-700',
    desc: 'Locate accredited electronic waste collection bins and licensed smelters compliant with KLHK standards.',
    stats: '85,400 kg diverted',
    link: '/map',
    actionText: 'Locate Drop-Off'
  }
];

const STAKEHOLDERS = [
  {
    id: 'citizens',
    title: 'For Citizens & Tech Owners',
    tagline: 'Turn drawer junk into instant rewards and circular eco-karma.',
    points: [
      'Instant AI Death Clock diagnostic for smartphones and laptops',
      'Free doorstep collection scheduling or drop-off navigation',
      'Earn verifiable EcoKarma points redeemable for partner perks',
      'Guaranteed NIST 800-88 data sanitization guidance'
    ],
    cta: 'Register as Citizen',
    link: '/register?role=user'
  },
  {
    id: 'technicians',
    title: 'For Repair Workshops',
    tagline: 'Receive qualified repair tickets and competitive customer quotes.',
    points: [
      'Direct customer repair dispatch without platform commissions',
      'Access surplus OEM components from B2B decom exchanges',
      'Verified Technician badge on the national map registry',
      'Automated diagnostic intake ticketing workflow'
    ],
    cta: 'Register as Technician',
    link: '/register?role=repair_provider'
  },
  {
    id: 'recyclers',
    title: 'For Licensed Waste Banks',
    tagline: 'Streamline bulk scrap intake and mineral sorting.',
    points: [
      'Digital intake tracking for municipal & commercial drop-offs',
      'Hazardous material manifests compliant with KLHK standards',
      'Direct linkage to industrial smelters and metal refineries',
      'Real-time weight auditing and digital disposal receipts'
    ],
    cta: 'Register as Recycler',
    link: '/register?role=recycler'
  },
  {
    id: 'enterprise',
    title: 'For Enterprises & ESG Leaders',
    tagline: 'Decommission IT assets with verifiable Scope 3 offsets.',
    points: [
      'Bulk inventory asset retirement and serial-number audit trails',
      'Certified destruction certificates for confidential compliance',
      'Quantitative carbon avoidance and mineral recovery reports',
      'B2B exchange for trading bulk surplus electronics'
    ],
    cta: 'Enterprise ESG Onboarding',
    link: '/register?role=business'
  }
];

const FAQS = [
  {
    q: 'How does the AI Death Clock estimate hardware lifespan?',
    a: 'Circuvio calculates device lifespan using historical failure distributions, battery cycle degradation models, thermal duty cycles, and real repair log data from certified Indonesian workshops. It gives you a predictive EOL date so you can repair or trade before total failure.'
  },
  {
    q: 'Is personal data safe when donating or recycling electronics?',
    a: 'Yes. Circuvio provides automated NIST 800-88 compliant sanitization protocols. Certified recyclers on our network sign strict compliance guarantees ensuring data storage mediums are either cryptographically wiped or physically crushed.'
  },
  {
    q: 'Can I drop off broken electronics for free?',
    a: 'Absolutely. Over 250 registered waste banks across 38 Indonesian provinces accept consumer e-waste for free. You also earn EcoKarma points for every verified kilogram diverted from public landfills.'
  },
  {
    q: 'How do repair shops get verified on the platform?',
    a: 'Technicians submit business licenses, proof of diagnostic equipment, and pass a baseline quality review. Once approved, they appear on the verified map and receive incoming repair requests from local citizens.'
  }
];

export default function Home() {
  const [selectedDevice, setSelectedDevice] = useState(HARDWARE_PRESETS[0]);
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[1]);
  const [activeStakeholder, setActiveStakeholder] = useState('citizens');
  const [openFaq, setOpenFaq] = useState(0);
  const [impactData, setImpactData] = useState(null);
  
  // Interactive iOS quick simulation slider (device age in years)
  const [simulatedAgeYears, setSimulatedAgeYears] = useState(2.5);

  useEffect(() => {
    getPlatformImpact()
      .then((res) => setImpactData(res?.data?.data))
      .catch(() => {});
  }, []);

  // Calculated valuation values
  const currentVal = Math.round(selectedDevice.baseValue * selectedCondition.mult);
  const avoidedCo2 = Math.round(selectedDevice.co2 * (selectedCondition.mult > 0.4 ? 1 : 0.85));
  const recoveredCopper = Math.round(selectedDevice.copper * (selectedCondition.mult > 0.3 ? 0.95 : 0.75));
  const recoveredGold = (selectedDevice.gold * (selectedCondition.mult > 0.3 ? 0.92 : 0.7)).toFixed(3);

  // Dynamic simulated battery health based on slider
  const simulatedBatteryHealth = Math.max(45, Math.round(100 - simulatedAgeYears * 9.5));

  const getActionTarget = () => {
    if (selectedCondition.id === 'pristine' || selectedCondition.id === 'good') {
      return { 
        text: 'List on Marketplace', 
        link: '/marketplace', 
        gradient: 'from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800' 
      };
    }
    if (selectedCondition.id === 'degraded') {
      return { 
        text: 'Book Certified Repair', 
        link: '/repair', 
        gradient: 'from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800' 
      };
    }
    return { 
      text: 'Drop at Waste Bank', 
      link: '/map', 
      gradient: 'from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900' 
    };
  };

  const actionTarget = getActionTarget();
  const IconComp = selectedDevice.icon;

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── TOP DYNAMIC ISLAND STATUS CAPSULE ───────────────── */}
      <div className="pt-4 pb-2 px-4 flex justify-center">
        <Link
          to="/map"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">
            Circuvio 2.0 • 254,821+ devices diverted from Indonesian landfills
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-0.5">
            Locate 250+ Waste Banks
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>

      {/* ── HERO SECTION: iOS MODERN FROSTED AESTHETIC ────────── */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Soft iOS Ambient Light Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Apple-Style Typography & Clear CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold tracking-wide">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Circular Tech Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 font-display tracking-tight leading-[1.08]">
                Find your device's{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                  best future.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                One assessment. Five competing circular pathways. Compare real repair quotes, certified resale offers, parts salvage, and safe recycling with complete transparency.
              </p>

              {/* iOS Pill Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/rescue" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm shadow-[0_4px_20px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Launch Rescue Engine</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </Link>

                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-semibold text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span>Create Free Account</span>
                  </button>
                </Link>
              </div>

              {/* iOS Style Micro-Metrics Strip */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800">100% Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800">10,250+ Citizens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <span className="font-semibold text-slate-800">4.9★ App Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800">38 Provinces</span>
                </div>
              </div>

            </div>

            {/* Right Column: Cupertino Glass Hardware Valuation Terminal */}
            <div className="lg:col-span-5">
              <div className="rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.07)] p-6 sm:p-7 space-y-5 relative">
                
                {/* Header with iOS Dynamic Pill */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Valuation Terminal</h3>
                      <p className="text-[11px] text-slate-400">Live AI residue & recovery engine</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold border border-emerald-500/20">
                    Live Rates
                  </span>
                </div>

                {/* Cupertino Segmented Control: Tech Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Hardware Category
                    </label>
                    <span className="text-[11px] font-medium text-slate-500">{selectedDevice.sub}</span>
                  </div>
                  
                  <div className="bg-slate-100/90 p-1 rounded-2xl flex gap-1 border border-slate-200/50">
                    {HARDWARE_PRESETS.map((p) => {
                      const Icon = p.icon;
                      const selected = selectedDevice.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedDevice(p)}
                          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-white text-slate-950 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-0.5 ${selected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-[10px] leading-tight truncate w-full text-center">
                            {p.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condition Selector: iOS Squircle List */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Condition Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map((c) => {
                      const selected = selectedCondition.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCondition(c)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs'
                              : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{c.label}</span>
                            {selected ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                            {c.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Calculated Balance Card (Apple Wallet Aesthetic) */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 space-y-3.5 shadow-lg">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Estimated Fair Value
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                        IDR {currentVal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedCondition.id === 'pristine' ? 'Resale Ready' : selectedCondition.id === 'degraded' ? 'Repair ROI' : 'Recycle Yield'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Avoided CO₂</span>
                      <span className="text-sm font-bold text-emerald-400 font-display">+{avoidedCo2} kg CO₂</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Precious Metals</span>
                      <span className="text-sm font-bold text-amber-400 font-display">{recoveredCopper}g Cu • {recoveredGold}g Au</span>
                    </div>
                  </div>
                </div>

                {/* iOS Primary Action Pill */}
                <Link to={actionTarget.link} className="block">
                  <button className={`w-full py-3.5 px-4 rounded-full text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${actionTarget.gradient} active:scale-[0.98]`}>
                    <span>{actionTarget.text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4 QUANTIFIED LIVE IMPACT STATS (iOS WIDGETS) ──────── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="rounded-[28px] bg-white border border-slate-200/80 p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              {impactData?.totalUsers?.toLocaleString() || '10,250+'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Registered Citizens</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across 38 provinces</p>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200/80 p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Recycle className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              {impactData?.totalWasteDepositedKg ? `${impactData.totalWasteDepositedKg.toLocaleString()} kg` : '254,821'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Devices Diverted</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero landfill destination</p>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200/80 p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              {impactData?.totalRepairsCompleted?.toLocaleString() || '12,647'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Certified Repairs</p>
            <p className="text-[11px] text-slate-400 mt-0.5">120+ verified technicians</p>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200/80 p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              3.5 Tons
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Precious Metals</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Copper, gold & rare earths</p>
          </div>

        </div>
      </section>

      {/* ── FOUR GAME-CHANGING PILLARS (APPLE KEYNOTE STYLE) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden rounded-3xl sm:rounded-[44px] my-6 max-w-7xl mx-auto shadow-2xl">
        {/* Apple Keynote Ambient Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/10 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Four Signature Pillars
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
              One device. Every possible future.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
              Not merely an app where people buy, sell, repair, and recycle. Circuvio finds the best possible outcome for every electronic device—and empowers you to follow through.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="rounded-[30px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 hover:bg-white/[0.07] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Pillar 1</span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">Circuvio Rescue Engine</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluates repair-and-keep, sell as-is, repair-and-resell, parts salvage, and certified recycling without sponsor kickbacks.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span>Assess in 60s →</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-[30px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 hover:bg-white/[0.07] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Pillar 2</span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">Device Truth Report</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn uncertainty into evidence. Guided checks, photo proofs, and diagnostics distinguish user claims from verified inspection with a transferable passport.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-semibold text-blue-400 flex items-center gap-1">
                <span>Tamper-evident passport →</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-[30px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 hover:bg-white/[0.07] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Pillar 3</span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">Device Futures Exchange</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Let the market compete for your hardware. Vetted repair specialists, buyers, and recyclers submit genuine competing bids on one verified profile.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>5 real competing quotes →</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-[30px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 hover:bg-white/[0.07] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Pillar 4</span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">Proof of Rescue</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real outcomes worth sharing. Generates verified certificates with documented repair costs, net savings, and quantified emissions prevented.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-semibold text-pink-400 flex items-center gap-1">
                <span>Shareable certificates →</span>
              </div>
            </div>

          </div>

          {/* Central Action Capsule */}
          <div className="text-center pt-2">
            <Link to="/rescue">
              <button className="px-8 py-4 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-400/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Find My Device's Best Future</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── THE 6 CIRCULAR PATHWAYS (iOS APP GRID) ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="brand" size="md">CIRCULAR ARCHITECTURE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            Six Pathways. Zero Landfill Tech.
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Every discarded electronic device has an optimal circular destination. Choose with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CIRCULAR_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className="rounded-[28px] bg-white border border-slate-200/80 p-6 sm:p-7 hover:border-emerald-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${path.gradient} text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {path.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-950 font-display">{path.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{path.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700">{path.stats}</span>
                  <Link
                    to={path.link}
                    className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{path.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW CIRCUVIO WORKS (3-STEP TIMELINE) ─────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="neutral" size="md">STREAMLINED 3-STEP JOURNEY</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            How Circuvio Closes the Loop
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From dormant drawer gadget to renewed lifespan or zero-landfill mineral recovery in three steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">01</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center font-display text-sm">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-display">Assess & Truth Report</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete guided diagnostics, submit hardware evidence, and establish a tamper-evident Device Passport with real verification confidence.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">02</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center font-display text-sm">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-display">Compare Competing Paths</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review 5 simultaneous quotes across repair, resale, donor harvest, and recycling. Optimize for money, convenience, lifespan, or emissions.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">03</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center font-display text-sm">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-display">Follow-Through & Proof</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Book doorstep courier handover, receive guaranteed data sanitization, earn EcoKarma, and share your official Proof of Rescue report.
            </p>
          </div>

        </div>
      </section>

      {/* ── STAKEHOLDER WORKSPACE SELECTOR ───────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl sm:rounded-[44px] max-w-7xl mx-auto my-6">
        <div className="space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider font-display border border-emerald-500/30">
              TAILORED HUBS FOR EVERY ROLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              One Unified Circular Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Dedicated operational workspaces for citizens, repair specialists, waste banks, and enterprises.
            </p>
          </div>

          {/* Segmented Switcher Control */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 justify-start sm:justify-center p-1 bg-slate-800/80 rounded-2xl max-w-2xl mx-auto border border-slate-700">
            {STAKEHOLDERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStakeholder(s.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeStakeholder === s.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {s.title.replace('For ', '')}
              </button>
            ))}
          </div>

          {/* Active Stakeholder Card */}
          {(() => {
            const current = STAKEHOLDERS.find(s => s.id === activeStakeholder) || STAKEHOLDERS[0];
            return (
              <div className="rounded-[32px] bg-slate-800/70 border border-slate-700/80 p-7 sm:p-10 max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">{current.title}</h3>
                  <p className="text-sm sm:text-base text-emerald-400 font-medium">{current.tagline}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                  {current.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">Zero commission on citizen recycling handoffs.</span>
                  <Link to={current.link} className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all">
                      {current.cta} →
                    </button>
                  </Link>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (ACCORDION) ───────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="neutral" size="md">TRANSPARENCY & ASSURANCE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Clear facts on verification, data safety, and circular e-waste compliance.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base font-display">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-600' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL HIGH-CONVERTING CALL TO ACTION ────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="rounded-[36px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-8 sm:p-14 text-white text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-emerald-900/10">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider font-display">
              JOIN THE CIRCUVIO MOVEMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              Ready to turn obsolete electronics into verified value?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Create your account in under 60 seconds. Connect your devices, receive competing circular bids, and follow through with verified outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]">
                Create Free Account
              </button>
            </Link>
            <Link to="/rescue" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-7 py-4 rounded-full border border-white/40 hover:bg-white/10 text-white font-bold text-sm transition-all active:scale-[0.98]">
                Rescue a Device
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CRISP LIGHT FOOTER ──────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200/80 py-14 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xs">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-950 font-display tracking-tight">Circuvio</span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Circuvio is the unified circular economy platform for electronic devices. Connecting tech owners, certified repair centers, and accredited recycling facilities.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
                  🇮🇩 Built for Indonesia
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  ISO 14001 Standards
                </span>
              </div>
            </div>

            {/* Circular Tools */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Circular Tools</p>
              <ul className="space-y-2">
                <li><Link to="/rescue" className="hover:text-emerald-700 transition-colors font-semibold text-emerald-800">Rescue Engine</Link></li>
                <li><Link to="/devices" className="hover:text-emerald-700 transition-colors">AI Death Clock</Link></li>
                <li><Link to="/marketplace" className="hover:text-emerald-700 transition-colors">Marketplace</Link></li>
                <li><Link to="/repair" className="hover:text-emerald-700 transition-colors">Repair Network</Link></li>
                <li><Link to="/map" className="hover:text-emerald-700 transition-colors">Waste Banks Map</Link></li>
              </ul>
            </div>

            {/* Civic Community */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Community</p>
              <ul className="space-y-2">
                <li><Link to="/community" className="hover:text-emerald-700 transition-colors">Discussion Hub</Link></li>
                <li><Link to="/communities" className="hover:text-emerald-700 transition-colors">Local Chapters</Link></li>
                <li><Link to="/challenges" className="hover:text-emerald-700 transition-colors">Challenges</Link></li>
                <li><Link to="/events" className="hover:text-emerald-700 transition-colors">Cleanup Events</Link></li>
                <li><Link to="/eco-impact" className="hover:text-emerald-700 transition-colors">Leaderboards</Link></li>
              </ul>
            </div>

            {/* Portals */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Role Portals</p>
              <ul className="space-y-2">
                <li><Link to="/apply" className="text-emerald-700 font-bold hover:underline">Apply as Pro Partner →</Link></li>
                <li><Link to="/dashboard" className="hover:text-emerald-700 transition-colors">Citizen Desk</Link></li>
                <li><Link to="/repair-provider" className="hover:text-emerald-700 transition-colors">Workshop Hub</Link></li>
                <li><Link to="/recycler" className="hover:text-emerald-700 transition-colors">Recycler Portal</Link></li>
                <li><Link to="/business-dashboard" className="hover:text-emerald-700 transition-colors">Business ESG</Link></li>
                <li><Link to="/admin" className="hover:text-emerald-700 transition-colors">Admin Console</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 Circuvio Platform. All rights reserved. Team Jai Mahakaal.</p>
            <div className="flex items-center gap-6 text-slate-600">
              <Link to="/about" className="hover:text-emerald-700 transition-colors">About Mission</Link>
              <Link to="/privacy" className="hover:text-emerald-700 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-emerald-700 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-emerald-700 transition-colors">Contact Support</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
