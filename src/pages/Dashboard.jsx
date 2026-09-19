import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Cpu, Plus, ArrowRight, Loader2, Leaf, TrendingUp, Zap, Recycle } from 'lucide-react';
import { getDashboard } from '../services/deviceService';
import useAuthStore from '../context/authStore';

const CATEGORY_ICONS = { smartphone: Smartphone, laptop: Laptop, tv: Monitor, computer: Cpu, printer: Cpu, tablet: Smartphone, refrigerator: Cpu, washing_machine: Cpu, ac: Cpu, other: Cpu };
const STATUS_COLORS = { excellent: 'text-emerald-700 bg-emerald-100', healthy: 'text-green-700 bg-green-100', warning: 'text-amber-700 bg-amber-100', critical: 'text-red-700 bg-red-100', dead: 'text-gray-700 bg-gray-100' };

function HealthRing({ score, size = 48 }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#22c55e' : score >= 40 ? '#f59e0b' : score >= 20 ? '#ef4444' : '#6b7280';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Role-based routing
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'organization') {
    return <Navigate to="/organization" replace />;
  }

  useEffect(() => {
    getDashboard().then((res) => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  const d = data || { totalDevices: 0, avgHealthScore: 0, impact: { co2Saved: 0, energySaved: 0, materialsRecovered: 0 }, recentDevices: [] };

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-600 mt-1">Here's your e-waste tracking overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{d.totalDevices}</div>
          <div className="text-xs text-gray-500">Devices Tracked</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{d.avgHealthScore}%</div>
          <div className="text-xs text-gray-500">Avg Health Score</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{d.impact.co2Saved}<span className="text-sm font-normal text-gray-500"> kg</span></div>
          <div className="text-xs text-gray-500">CO₂ Saved</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
            <Recycle className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{d.impact.materialsRecovered}<span className="text-sm font-normal text-gray-500"> kg</span></div>
          <div className="text-xs text-gray-500">Materials Recovered</div>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Your Devices</h2>
            <Link to="/devices" className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {d.recentDevices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No devices yet</p>
              <Link to="/devices" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                <Plus className="w-4 h-4" /> Add Your First Device
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {d.recentDevices.map((device) => {
                const Icon = CATEGORY_ICONS[device.category] || Smartphone;
                const dc = device.deathClock;
                return (
                  <Link key={device.id} to={`/devices/${device.id}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group">
                    <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{device.name}</div>
                      <div className="text-xs text-gray-500">{device.brand} · {device.category}</div>
                    </div>
                    <HealthRing score={dc.healthScore} />
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{dc.remainingDays}d</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[dc.status]}`}>{dc.status}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link to="/devices?action=add" className="block p-6 bg-emerald-600 rounded-xl text-white hover:bg-emerald-700 transition-all">
            <Plus className="w-8 h-8 mb-3" />
            <div className="font-semibold text-lg">Add Device</div>
            <div className="text-emerald-100 text-sm">Track a new device & get death clock prediction</div>
          </Link>
          <Link to="/impact" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all">
            <Leaf className="w-8 h-8 text-emerald-600 mb-3" />
            <div className="font-semibold text-gray-900">View Impact</div>
            <div className="text-gray-500 text-sm">See your environmental contribution</div>
          </Link>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="font-semibold text-gray-900 mb-2">EcoLoop AI</div>
            <div className="text-gray-500 text-sm mb-3">Get AI-powered device analysis and recycling recommendations</div>
            <div className="text-xs text-emerald-600 font-medium">Powered by Gemini AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
