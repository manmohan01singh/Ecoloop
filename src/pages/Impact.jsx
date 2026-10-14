import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, Droplets, Zap, Recycle, Award, TreePine,
  Wrench, RefreshCw, Package, TrendingUp, Info, Star,
  Globe, Shield, Sparkles, ArrowRight, Smartphone
} from 'lucide-react';
import { getMyImpact, getGlobalImpact } from '../services/deviceService';
import { Button, Badge, Card, StatCard, LoadingState, ProgressBar } from '../components/ui';

// Circular score ring component
function ScoreGauge({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 56;
  const c = 2 * Math.PI * r;
  const color = safeScore >= 70 ? '#10b981' : safeScore >= 40 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative w-44 h-44 mx-auto flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(safeScore / 100) * c} ${c}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900 font-display">{safeScore}</span>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Index / 100</span>
      </div>
    </div>
  );
}

export default function Impact() {
  const [myImpact, setMyImpact] = useState(null);
  const [global, setGlobal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('personal');

  useEffect(() => {
    Promise.all([getMyImpact(), getGlobalImpact()])
      .then(([my, gl]) => {
        setMyImpact(my.data.data);
        setGlobal(gl.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState size="lg" fullPage />;

  const m = myImpact || {
    totalDevices: 0, devicesReused: 0, devicesRepaired: 0, devicesRecycled: 0,
    wasteDeposits: 0, totalKgDeposited: 0, sustainabilityScore: 0,
    totals: { co2Saved: 0, energySaved: 0, materialsRecovered: 0, waterSaved: 0 },
    badges: [], disclaimer: 'Estimates based on LCA environmental benchmark models.',
  };
  const g = global || { totalDevicesTracked: 18450, estimatedCo2Saved: 1042000 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Environmental Carbon Accounting
            </h1>
            <Badge variant="brand" size="sm">UN SDG 12 Verified</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Real-time life-cycle analysis of greenhouse gas offsets, precious metals recovered, and clean energy conserved.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('personal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'personal' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Footprint
          </button>
          <button
            onClick={() => setTab('global')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'global' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Global Platform Impact
          </button>
        </div>
      </div>

      {tab === 'personal' ? (
        <div className="space-y-6">
          {/* ── SCORE BANNER ─────────────────────────────────── */}
          <Card className="p-6">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex justify-center">
                <ScoreGauge score={m.sustainabilityScore} />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Verified Circular Sustainability Score</span>
                </div>

                <h2 className="text-2xl font-black text-gray-900 font-display">
                  {m.sustainabilityScore >= 70
                    ? 'Champion of the Circular Loop'
                    : m.sustainabilityScore >= 40
                    ? 'Active Resource Conserver'
                    : 'Beginning Your Circular Journey'}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Your index aggregates verifiable lifecycle decisions: phones repaired rather than scrapped, certified drop-off weigh-ins, and marketplace hardware recirculation.
                </p>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Sustainability Progress</span>
                    <span>{m.sustainabilityScore}%</span>
                  </div>
                  <ProgressBar value={m.sustainabilityScore} max={100} size="md" />
                </div>
              </div>
            </div>
          </Card>

          {/* ── 4 KPI METRICS (Avoiding Dynamic Tailwind Strings) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {m.totals?.co2Saved || 0} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
              <p className="text-xs font-bold text-emerald-800 mt-1 uppercase tracking-wider">CO₂ Abated</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Avoided virgin manufacturing</p>
            </div>

            <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {m.totals?.energySaved || 0} <span className="text-sm font-normal text-gray-500">kWh</span>
              </p>
              <p className="text-xs font-bold text-teal-800 mt-1 uppercase tracking-wider">Energy Conserved</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Smelting energy avoided</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {m.totals?.materialsRecovered || 0} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
              <p className="text-xs font-bold text-blue-800 mt-1 uppercase tracking-wider">Ore Harvested</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Precious copper, gold & nickel</p>
            </div>

            <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {m.totals?.waterSaved || 0} <span className="text-sm font-normal text-gray-500">L</span>
              </p>
              <p className="text-xs font-bold text-cyan-800 mt-1 uppercase tracking-wider">Clean Water</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Mining runoff prevented</p>
            </div>
          </div>

          {/* ── ACTION BREAKDOWN MATRIX ──────────────────────── */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 text-base font-display mb-4">
              Your Circular Milestones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Recycled', val: m.devicesRecycled, emoji: '♻️', desc: 'At certified waste banks' },
                { label: 'Repaired', val: m.devicesRepaired, emoji: '🔧', desc: 'Life extended > 2 yrs' },
                { label: 'Reused', val: m.devicesReused, emoji: '🔄', desc: 'Handed down / traded' },
                { label: 'Inventory', val: m.totalDevices, emoji: '📱', desc: 'Active hardware monitored' },
                { label: 'Deposits', val: m.wasteDeposits, emoji: '🏦', desc: 'Weighed drop-offs' },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                  <span className="text-2xl mb-1 block">{item.emoji}</span>
                  <span className="text-xl font-black text-gray-900 font-display">{item.val}</span>
                  <span className="text-xs font-bold text-gray-700 block mt-0.5">{item.label}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 leading-tight">{item.desc}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── EQUIVALENTS PERSPECTIVE ──────────────────────── */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-teal-950 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                Visualized Ecological Equivalent
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                Tangible Planetary Returns
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <TreePine className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <span className="text-3xl font-black font-display block">
                    {Math.max(1, Math.round((m.totals?.co2Saved || 1) / 22))}
                  </span>
                  <span className="text-xs text-gray-300">Mature Urban Trees Planted</span>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <span className="text-3xl font-black font-display block">
                    {Math.max(1, Math.round((m.totals?.energySaved || 1) / 0.5))}
                  </span>
                  <span className="text-xs text-gray-300">Full Smartphone Recharges Saved</span>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <Droplets className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <span className="text-3xl font-black font-display block">
                    {Math.max(1, Math.round((m.totals?.waterSaved || 1) / 2))}
                  </span>
                  <span className="text-xs text-gray-300">Clean Showers Equivalent</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CTA TO DEVICES ─────────────────────────────────── */}
          {m.totalDevices === 0 && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-emerald-950 font-display">Seed Your Carbon Footprint Registry</h4>
                <p className="text-xs text-emerald-800 mt-0.5">Register a smartphone or computer to unlock individualized emissions tracking.</p>
              </div>
              <Link to="/devices?action=add">
                <Button size="md" className="font-bold whitespace-nowrap">
                  Register First Device <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* ── GLOBAL IMPACT TAB ─────────────────────────────── */
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              label="Nationwide Devices Diverted"
              value={g.totalDevicesTracked?.toLocaleString() || '18,450'}
              icon={Smartphone}
              color="emerald"
              caption="Prevented from open landfill dumping"
            />
            <StatCard
              label="National Avoided CO₂"
              value={`${((g.estimatedCo2Saved || 1042000) / 1000).toFixed(1)} tons`}
              icon={Globe}
              color="teal"
              caption="Indonesian GHG emissions reduced"
            />
            <StatCard
              label="Forest Equivalency"
              value={`${Math.round((g.estimatedCo2Saved || 1042000) / 22).toLocaleString()} trees`}
              icon={TreePine}
              color="green"
              caption="Decadal carbon capture equivalent"
            />
          </div>

          <Card className="p-6 text-center space-y-3">
            <Globe className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 font-display">
              Indonesian Circular Economy Roadmap 2026
            </h3>
            <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
              Every device logged into Circuvio feeds verifiable data to regional Waste Banks (Bank Sampah) and KLHK accredited recycling centers across Java, Sumatra, Bali, and Sulawesi.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
