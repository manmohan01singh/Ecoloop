import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Recycle, Wrench, MapPin, Trophy, Zap, Heart,
  Package, Sparkles, Shield, Star, ChevronDown, CheckCircle2,
  Cpu, Smartphone, Laptop, Tv, Building2, Battery, RefreshCw,
  Globe, ArrowUpRight, ShieldCheck, Flame, Compass, Activity,
  Sliders, Layers, Terminal, Gift, Check, HelpCircle, Leaf, Award
} from 'lucide-react';
import { getPlatformImpact } from '../services/communityService';
import { Button, Badge } from '../components/ui';

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
    name: '4K Smart Display / TV',
    sub: '55" - 65" OLED Panels',
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
    sub: 'AC / Smart Refrigerator',
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
    sub: 'UPS / Power Station',
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
  { id: 'pristine', label: 'Like New', mult: 1.0, desc: 'Fully functional, no cosmetic defects' },
  { id: 'good', label: 'Good Working', mult: 0.75, desc: 'Normal wear, all components operational' },
  { id: 'degraded', label: 'Needs Repair', mult: 0.45, desc: 'Broken screen, weak battery, or ports' },
  { id: 'salvage', label: 'Scrap / Salvage', mult: 0.18, desc: 'Unresponsive, suitable for precious metals' }
];

const CIRCULAR_PATHS = [
  {
    id: 'repair',
    title: 'Certified Repair Network',
    badge: 'Hardware Revival',
    icon: Wrench,
    color: 'emerald',
    desc: 'Connect with 120+ vetted diagnostic repair centers across Indonesia with transparent pricing and warranty.',
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
    desc: 'List working gadgets and salvage components directly to buyers with secure escrow and authenticity grading.',
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
    desc: 'Rescue memory sticks, panels, copper heatsinks, and cables to keep existing machines functioning.',
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
    desc: 'Locate accredited electronic waste collection bins and licensed smelters compliant with KLHK standards.',
    stats: '85,400 kg diverted',
    link: '/map',
    actionText: 'Locate Nearest Drop-Off'
  }
];

const STAKEHOLDERS = [
  {
    id: 'citizens',
    title: 'For Citizens & Tech Owners',
    tagline: 'Turn drawer junk into instant rewards and eco-karma.',
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
    tagline: 'Receive qualified repair tickets and customer inquiries.',
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
    a: 'EcoLoop calculates device lifespan using historical failure distributions, battery cycle degradation models, thermal duty cycles, and real repair log data from certified Indonesian workshops. It gives you a predictive EOL date so you can repair or trade before total failure.'
  },
  {
    q: 'Is personal data safe when donating or recycling electronics?',
    a: 'Yes. EcoLoop provides automated NIST 800-88 compliant sanitization protocols. Certified recyclers on our network sign strict compliance guarantees ensuring data storage mediums are either cryptographically wiped or physically crushed.'
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

  const getActionTarget = () => {
    if (selectedCondition.id === 'pristine' || selectedCondition.id === 'good') {
      return { text: 'List on Marketplace', link: '/marketplace', color: 'bg-emerald-600 hover:bg-emerald-700' };
    }
    if (selectedCondition.id === 'degraded') {
      return { text: 'Book Certified Repair', link: '/repair', color: 'bg-orange-600 hover:bg-orange-700' };
    }
    return { text: 'Drop at Waste Bank', link: '/map', color: 'bg-green-700 hover:bg-green-800' };
  };

  const actionTarget = getActionTarget();
  const IconComp = selectedDevice.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      
      {/* ── TOP ANNOUNCEMENT BANNER ─────────────────────────── */}
      <div className="bg-emerald-900 text-emerald-100 py-2.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide uppercase font-display text-emerald-300">
              National Circular Electronics 2026
            </span>
            <span className="hidden md:inline text-emerald-400/60">•</span>
            <span className="hidden md:inline text-emerald-200">
              254,821+ devices diverted from Indonesian landfills • Compliant with KLHK standards
            </span>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-1 font-bold text-emerald-300 hover:text-white transition-colors"
          >
            <span>Locate 250+ Waste Banks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headline & Primary Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider font-display">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Indonesia Circular Economy Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-display tracking-tight leading-[1.1]">
                Turn e-waste into value.{' '}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                  Save tech,
                </span>{' '}
                harvest minerals.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with certified repair technicians, licensed waste banks, and circular buyers across Indonesia. Predict device failure dates, prevent toxic landfill dumping, and trade surplus hardware.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/rescue" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 font-display">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Find My Device's Best Future</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2 font-display">
                    <span>Create Free Account</span>
                  </button>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">100% Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">10,250+ Citizens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span className="font-semibold">4.9★ Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold">38 Provinces</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Hardware Valuation Terminal */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7 space-y-5">
                
                {/* Widget Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">Hardware Valuation Terminal</h3>
                      <p className="text-[11px] text-slate-500">Live resale & carbon calculation</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Live Calculator
                  </span>
                </div>

                {/* Device Selector Pills (Mobile-Friendly Horizontal Scroll) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Tech Category
                  </label>
                  <div className="flex sm:grid sm:grid-cols-5 gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {HARDWARE_PRESETS.map((p) => {
                      const Icon = p.icon;
                      const selected = selectedDevice.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedDevice(p)}
                          className={`flex-shrink-0 sm:flex-shrink flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                            selected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${selected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-[11px] leading-tight truncate w-full">{p.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Device Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map((c) => {
                      const selected = selectedCondition.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCondition(c)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{c.label}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 line-clamp-1">
                            {c.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Calculated Metrics Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Fair Value</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                        IDR {currentVal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      {selectedCondition.id === 'pristine' ? 'Resale Ready' : selectedCondition.id === 'degraded' ? 'Repair ROI' : 'Recycle Yield'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block font-semibold">Avoided CO₂</span>
                      <span className="text-sm font-bold text-emerald-700 font-display">+{avoidedCo2} kg CO₂</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block font-semibold">Copper & Gold</span>
                      <span className="text-sm font-bold text-amber-700 font-display">{recoveredCopper}g Cu • {recoveredGold}g Au</span>
                    </div>
                  </div>
                </div>

                {/* Call to action for current assessment */}
                <Link to={actionTarget.link} className="block">
                  <button className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${actionTarget.color}`}>
                    <span>{actionTarget.text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4 QUANTIFIED LIVE IMPACT STATS ──────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              {impactData?.totalUsers?.toLocaleString() || '10,250+'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Registered Citizens</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across 38 provinces</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              {impactData?.totalWasteDepositedKg ? `${impactData.totalWasteDepositedKg.toLocaleString()} kg` : '254,821'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Devices Diverted</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero landfill destination</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-2">
              <Wrench className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              {impactData?.totalRepairsCompleted?.toLocaleString() || '12,647'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Certified Repairs</p>
            <p className="text-[11px] text-slate-400 mt-0.5">120+ verified technicians</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              3.5 Tons
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Precious Metals</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Copper, gold & rare earths</p>
          </div>

        </div>
      </section>

      {/* ── FOUR GAME-CHANGING FEATURES FOR ECOLOOP ─────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Four Game-Changing Pillars
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
              One device. Every possible future.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Not merely an app where people buy, sell, repair, and recycle. EcoLoop finds the best possible future for every electronic device—and actually helps the owner achieve it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-emerald-500/60 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Pillar 1</span>
                  <h3 className="text-xl font-extrabold text-white font-display mt-0.5">EcoLoop Rescue Engine</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluates repair-and-keep, sell as-is, repair-and-resell, parts salvage, and certified recycling without sponsor bias. One informed decision.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Assess in 60s →</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-blue-500/60 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Pillar 2</span>
                  <h3 className="text-xl font-extrabold text-white font-display mt-0.5">Device Truth Report</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn uncertainty into evidence. Guided checks, photo proofs, and auto-diagnostics distinguish user claims from verified inspection with a transferable passport.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 text-xs font-bold text-blue-400 flex items-center gap-1">
                <span>Tamper-evident passport →</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-amber-500/60 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pillar 3</span>
                  <h3 className="text-xl font-extrabold text-white font-display mt-0.5">Device Futures Exchange</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Let the market compete for the device. Vetted technicians, used-device buyers, and authorized recyclers submit real competing quotes on one profile.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>5 real competing quotes →</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-pink-500/60 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Pillar 4</span>
                  <h3 className="text-xl font-extrabold text-white font-display mt-0.5">Proof of Rescue</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real outcomes worth sharing. Generates certified reports with verified repair costs, money saved, documented work, and qualified carbon emissions prevented.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 text-xs font-bold text-pink-400 flex items-center gap-1">
                <span>Shareable certificates →</span>
              </div>
            </div>

          </div>

          {/* Central Callout Banner */}
          <div className="text-center pt-4">
            <Link to="/rescue">
              <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Launch Signature Rescue Engine Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── THE 6 CIRCULAR PATHWAYS ─────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="brand" size="md">THE CIRCULAR ENGINE</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              Six Pathways. Zero Landfill Tech.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Not all discarded electronics are trash. Choose the optimal environmental path for every device in your home or organization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CIRCULAR_PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <div
                  key={path.id}
                  className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 p-6 sm:p-7 transition-all hover:shadow-lg flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-emerald-700" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                        {path.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display">{path.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{path.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
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

        </div>
      </section>

      {/* ── HOW ECOLOOP WORKS ───────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="brand" size="md">SIMPLE 3-STEP WORKFLOW</Badge>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
            How EcoLoop Closes the Loop
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From dead smartphone to recovered minerals or happy new owner in three verified steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center font-display">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">Diagnose & Value</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use the AI Death Clock to predict remaining battery and hardware lifespan, or calculate fair resale, repair, and mineral scrap value.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">02</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center font-display">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">Pick Your Circular Path</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Book a certified technician, list the gadget on the marketplace, donate to school programs, or schedule a waste bank drop-off.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs relative">
            <span className="text-5xl font-black text-slate-100 font-display absolute top-6 right-6 select-none">03</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center font-display">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">Verified Carbon Offset</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Receive cryptographic proof of digital sanitization and recycling, collect EcoKarma reward points, and view your verified CO₂ avoided.
            </p>
          </div>

        </div>
      </section>

      {/* ── 4-STAKEHOLDER ECOSYSTEM CONSOLE ─────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider font-display border border-emerald-500/30">
              NATIONAL ECOSYSTEM FOR EVERY ROLE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
              Tailored Portals for Every Circular Partner
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Whether you are an individual citizen, workshop technician, licensed recycler, or enterprise ESG officer, EcoLoop has a dedicated workspace.
            </p>
          </div>

          {/* Stakeholder Switcher Buttons (Mobile-Friendly Horizontal Scroll) */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 justify-start sm:justify-center pb-2">
            {STAKEHOLDERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStakeholder(s.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeStakeholder === s.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
              <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-display">{current.title}</h3>
                  <p className="text-sm sm:text-base text-emerald-400 font-medium">{current.tagline}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
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
                    <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all font-display">
                      {current.cta} →
                    </button>
                  </Link>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ──────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="neutral" size="md">TRANSPARENCY & ASSURANCE</Badge>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about Indonesian circular e-waste compliance.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base font-display">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-600' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL HIGH-CONVERTING CALL TO ACTION ────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-emerald-900/10">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider font-display">
              JOIN THE CIRCULAR MOVEMENT TODAY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Ready to turn obsolete electronics into verified value?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Create your account in under 60 seconds. Connect your devices, locate local drop-offs, and start saving carbon.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-md transition-all font-display">
                Create Free Account
              </button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-7 py-4 rounded-xl border border-white/40 hover:bg-white/10 text-white font-bold text-sm transition-all font-display">
                View Waste Banks Map
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CRISP LIGHT FOOTER ──────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900 font-display">EcoLoop</span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Indonesia's unified circular economy platform for electronic waste. Connecting citizens, certified repair centers, and accredited recycling facilities.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                  🇮🇩 Built for Indonesia
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ISO 14001 Standards
                </span>
              </div>
            </div>

            {/* Circular Tools */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Circular Tools</p>
              <ul className="space-y-2">
                <li><Link to="/devices" className="hover:text-emerald-700 transition-colors">AI Death Clock</Link></li>
                <li><Link to="/marketplace" className="hover:text-emerald-700 transition-colors">Marketplace</Link></li>
                <li><Link to="/repair" className="hover:text-emerald-700 transition-colors">Repair Network</Link></li>
                <li><Link to="/map" className="hover:text-emerald-700 transition-colors">Waste Banks Map</Link></li>
                <li><Link to="/business" className="hover:text-emerald-700 transition-colors">B2B Exchange</Link></li>
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
                <li><Link to="/dashboard" className="hover:text-emerald-700 transition-colors">Citizen Desk</Link></li>
                <li><Link to="/repair-provider" className="hover:text-emerald-700 transition-colors">Workshop Hub</Link></li>
                <li><Link to="/recycler" className="hover:text-emerald-700 transition-colors">Recycler Portal</Link></li>
                <li><Link to="/business-dashboard" className="hover:text-emerald-700 transition-colors">Business ESG</Link></li>
                <li><Link to="/admin" className="hover:text-emerald-700 transition-colors">Admin Console</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 EcoLoop Platform. All rights reserved. Team Jai Mahakaal.</p>
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
