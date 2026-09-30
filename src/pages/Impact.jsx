import { useState, useEffect } from 'react';
import {
  Leaf, Droplets, Zap, Recycle, Award, Loader2, TreePine,
  Wrench, RefreshCw, Package, TrendingUp, Info, Star
} from 'lucide-react';
import { getMyImpact, getGlobalImpact } from '../services/deviceService';

// Circular gauge component
function ScoreRing({ score }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function Impact() {
  const [myImpact, setMyImpact] = useState(null);
  const [global, setGlobal]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('personal');

  useEffect(() => {
    Promise.all([getMyImpact(), getGlobalImpact()])
      .then(([my, gl]) => { setMyImpact(my.data.data); setGlobal(gl.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  const m = myImpact || {
    totalDevices: 0, devicesReused: 0, devicesRepaired: 0, devicesRecycled: 0,
    wasteDeposits: 0, totalKgDeposited: 0, sustainabilityScore: 0,
    totals: { co2Saved: 0, energySaved: 0, materialsRecovered: 0, waterSaved: 0 },
    badges: [], disclaimer: '',
  };
  const g = global || { totalDevicesTracked: 0, estimatedCo2Saved: 0 };

  const TABS = [['personal', 'My Impact'], ['global', 'Global Impact']];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Environmental Impact</h1>
        <p className="text-gray-500 mt-1">Track your contribution to a circular economy</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'personal' && (
        <div className="space-y-6">

          {/* ── Sustainability Score ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Sustainability Score</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreRing score={m.sustainabilityScore} />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-600">
                  Your score is based on devices tracked, repairs completed, items recycled, and waste deposits made.
                  The higher your score, the more you're contributing to a circular economy.
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all ${m.sustainabilityScore >= 70 ? 'bg-emerald-500' : m.sustainabilityScore >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${m.sustainabilityScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {m.sustainabilityScore >= 70 ? '🌟 Excellent — You\'re a sustainability champion!' :
                   m.sustainabilityScore >= 40 ? '🌱 Good — Keep going, you\'re making a difference!' :
                   '💡 Getting started — every action counts!'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Device Action Counts ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your E-Waste Impact</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '♻️', label: 'Devices Recycled',  value: m.devicesRecycled,  color: 'bg-green-50 border-green-200' },
                { icon: '🔧', label: 'Devices Repaired',  value: m.devicesRepaired,  color: 'bg-orange-50 border-orange-200' },
                { icon: '🔄', label: 'Devices Reused',    value: m.devicesReused,    color: 'bg-blue-50 border-blue-200' },
                { icon: '📱', label: 'Devices Tracked',   value: m.totalDevices,     color: 'bg-emerald-50 border-emerald-200' },
                { icon: '🏦', label: 'Waste Deposits',    value: m.wasteDeposits,    color: 'bg-teal-50 border-teal-200' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl border text-center ${s.color}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
            {m.totalKgDeposited > 0 && (
              <p className="text-sm text-emerald-700 font-medium mt-3 text-center">
                🌿 {m.totalKgDeposited} kg of e-waste deposited at collection points
              </p>
            )}
          </div>

          {/* ── Environmental Estimates ──────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Estimated Environmental Savings</h2>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                  These are approximations based on industry averages, not exact measurements.
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              ⚠️ {m.disclaimer}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap,      label: 'CO₂ Saved',           value: m.totals.co2Saved,           unit: 'kg',  color: 'emerald' },
                { icon: Leaf,     label: 'Energy Saved',         value: m.totals.energySaved,        unit: 'kWh', color: 'green' },
                { icon: Recycle,  label: 'Materials Recovered',  value: m.totals.materialsRecovered, unit: 'kg',  color: 'teal' },
                { icon: Droplets, label: 'Water Saved',          value: m.totals.waterSaved,         unit: 'L',   color: 'cyan' },
              ].map(s => (
                <div key={s.label} className={`p-4 bg-${s.color}-50 rounded-xl text-center border border-${s.color}-100`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-600 mx-auto mb-2`} />
                  <div className="text-xl font-bold text-gray-900">
                    {s.value}<span className="text-sm font-normal text-gray-500 ml-1">{s.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Equivalents ─────────────────────────────────── */}
          {(m.totals.co2Saved > 0 || m.totals.energySaved > 0) && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Your Impact in Perspective</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center bg-white/10 rounded-xl p-4">
                  <TreePine className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                  <div className="text-3xl font-bold">{Math.max(0, Math.round(m.totals.co2Saved / 22))}</div>
                  <div className="text-emerald-200 text-sm mt-1">Trees Equivalent</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-4">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                  <div className="text-3xl font-bold">{Math.max(0, Math.round(m.totals.energySaved / 0.5))}</div>
                  <div className="text-emerald-200 text-sm mt-1">Phone Charges Saved</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-4">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                  <div className="text-3xl font-bold">{Math.max(0, Math.round(m.totals.waterSaved / 2))}</div>
                  <div className="text-emerald-200 text-sm mt-1">Showers Saved</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Badges ──────────────────────────────────────── */}
          {m.badges?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Badges Earned
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {m.badges.map(b => (
                  <div key={b.id || b.name} className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                    <div className="text-3xl mb-2">{b.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{b.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{b.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {m.totalDevices === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1 font-medium">No impact data yet</p>
              <p className="text-gray-400 text-sm mb-4">Add your first device to start tracking your environmental footprint.</p>
              <a href="/devices" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
                + Add a Device
              </a>
            </div>
          )}
        </div>
      )}

      {tab === 'global' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">EcoLoop Platform Impact</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-700">{g.totalDevicesTracked}</div>
                <div className="text-sm text-gray-500 mt-1">Devices Tracked</div>
              </div>
              <div className="p-5 bg-teal-50 rounded-xl text-center border border-teal-100">
                <div className="text-3xl font-bold text-teal-700">{g.estimatedCo2Saved} kg</div>
                <div className="text-sm text-gray-500 mt-1">CO₂ Saved (Est.)</div>
              </div>
              <div className="p-5 bg-green-50 rounded-xl text-center border border-green-100">
                <div className="text-3xl font-bold text-green-700">{Math.round(g.estimatedCo2Saved / 22)}</div>
                <div className="text-sm text-gray-500 mt-1">Trees Equivalent</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              ⚠️ Global estimates are based on industry averages and are not exact measurements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
