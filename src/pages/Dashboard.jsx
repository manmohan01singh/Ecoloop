import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Smartphone, Laptop, Monitor, Cpu, Plus, ArrowRight, Leaf, TrendingUp, Zap, Recycle,
  Wrench, Package, MapPin, Trophy, Shield, Sparkles, ChevronRight, AlertCircle, Clock
} from 'lucide-react';
import { getDashboard } from '../services/deviceService';
import useAuthStore from '../context/authStore';
import { Card, StatCard, LoadingState, EmptyState, Button, Badge } from '../components/ui';

const CATEGORY_ICONS = {
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Monitor,
  computer: Cpu,
  printer: Cpu,
  tablet: Smartphone,
  refrigerator: Cpu,
  washing_machine: Cpu,
  ac: Cpu,
  other: Cpu
};

const STATUS_BADGES = {
  excellent: { variant: 'success', label: 'Optimal' },
  healthy: { variant: 'brand', label: 'Healthy' },
  warning: { variant: 'warning', label: 'Degrading' },
  critical: { variant: 'error', label: 'Critical' },
  dead: { variant: 'neutral', label: 'Depleted' },
};

function HealthRing({ score, size = 44 }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#22c55e' : score >= 40 ? '#f59e0b' : score >= 20 ? '#ef4444' : '#6b7280';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(score/100)*c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-extrabold text-gray-900">{score}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook runs unconditionally! Redirection for specialized roles is performed cleanly in useEffect.
  useEffect(() => {
    if (user?.role && user.role !== 'user') {
      const roleRedirects = {
        admin: '/admin',
        organization: '/organization',
        moderator: '/moderator',
        recycler: '/recycler',
        repair_provider: '/repair-provider',
        business: '/business-dashboard',
      };
      if (roleRedirects[user.role]) {
        navigate(roleRedirects[user.role], { replace: true });
        return;
      }
    }

    getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => {
        console.warn('Dashboard service error (using fallback defaults):', err);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return <LoadingState size="lg" fullPage />;
  }

  const d = data || {
    totalDevices: 0,
    avgHealthScore: 0,
    impact: { co2Saved: 0, energySaved: 0, materialsRecovered: 0 },
    recentDevices: []
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Contributor';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* ── WELCOME & COCKPIT BANNER ─────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CIVIC SUSTAINABILITY DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Here is your active circular tech footprint. Track hardware health, prevent carbon emissions, and earn verifiable EcoKarma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/devices?action=add">
              <Button variant="primary" size="md" className="font-bold shadow-md shadow-emerald-500/20">
                <Plus className="w-4 h-4 mr-1.5" /> Log New Device
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="secondary" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold">
                Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 CORE STAT CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Devices Tracked"
          value={d.totalDevices}
          unit="active"
          change="+1"
          changeLabel="this month"
          icon={Smartphone}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          title="Average Health"
          value={`${d.avgHealthScore}%`}
          change={d.avgHealthScore >= 60 ? 'Healthy' : 'Needs Check'}
          changeType={d.avgHealthScore >= 60 ? 'increase' : 'decrease'}
          changeLabel="fleet average"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          progress={d.avgHealthScore}
        />
        <StatCard
          title="Avoided CO₂"
          value={d.impact.co2Saved}
          unit="kg CO₂e"
          change="+12.4kg"
          changeLabel="via repairs"
          icon={Zap}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 border-teal-100"
        />
        <StatCard
          title="Materials Recovered"
          value={d.impact.materialsRecovered}
          unit="kg"
          change="+3.2kg"
          changeLabel="precious metals"
          icon={Recycle}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
        />
      </div>

      {/* ── QUICK CIRCULAR ACTIONS ROW ─────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 font-display">Quick Circular Actions</h2>
          <span className="text-xs text-gray-400">Choose a path for your electronics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: 'Track Death Clock', desc: 'Predict device remaining life', icon: Smartphone, link: '/devices?action=add', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { title: 'Book Verified Repair', desc: 'Screen, battery, motherboard', icon: Wrench, link: '/repair', color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { title: 'Sell / Trade Item', desc: 'List on circular marketplace', icon: Package, link: '/marketplace', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { title: 'Locate Waste Bank', desc: 'Find certified drop-off spots', icon: MapPin, link: '/map', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map((act) => (
            <Link
              key={act.title}
              to={act.link}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${act.color}`}>
                <act.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {act.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{act.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID: DEVICES & COMMUNITY ────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Tracked Devices */}
        <Card variant="elevated" className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">Your Tracked Devices</h2>
              <p className="text-xs text-gray-500">Live lifespan telemetry & predictive diagnostics</p>
            </div>
            <Link to="/devices" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              View All ({d.totalDevices}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {d.recentDevices.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="No devices registered yet"
              description="Add your first phone, laptop, or appliance to predict its lifespan and prevent premature disposal."
              action={{
                label: 'Add First Device',
                onClick: () => navigate('/devices?action=add'),
                icon: Plus
              }}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {d.recentDevices.map((device) => {
                const IconComponent = CATEGORY_ICONS[device.category] || Smartphone;
                const statusInfo = STATUS_BADGES[device.status] || STATUS_BADGES.healthy;
                const healthScore = device.healthScore ?? 75;

                return (
                  <div key={device.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                        <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/devices/${device.id}`} className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors truncate block">
                          {device.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="capitalize">{device.brand || device.category}</span>
                          <span>•</span>
                          <span className="capitalize">{device.condition?.replace('_', ' ') || 'Good'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <HealthRing score={healthScore} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Column: EcoKarma & Community Spotlight */}
        <div className="space-y-6">
          {/* EcoKarma Rank Card */}
          <Card variant="elevated" className="p-6 bg-gradient-to-br from-emerald-900 to-gray-900 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> EcoKarma Tier
              </span>
              <Badge variant="brand" size="sm" className="bg-emerald-800 text-white border-emerald-700">Level 2</Badge>
            </div>

            <p className="text-3xl font-black font-display tracking-tight text-white mb-1">
              420 <span className="text-sm font-normal text-emerald-300">points</span>
            </p>
            <p className="text-xs text-gray-300 mb-4">
              80 more points to unlock the <strong className="text-white">Circular Hero</strong> badge.
            </p>

            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 w-[84%] rounded-full" />
            </div>

            <Link to="/eco-impact" className="block text-center w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
              View National Leaderboards →
            </Link>
          </Card>

          {/* Environmental Mission Tip */}
          <Card variant="flat" className="p-5 border-emerald-200 bg-emerald-50/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm font-display">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Did you know?</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Repairing a laptop extends its active usable lifespan by an average of <strong>3.2 years</strong>, preventing over <strong>175 kg of CO₂</strong> emissions generated during new device manufacturing.
            </p>
            <Link to="/challenges" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">
              Join the "Fix Before You Buy" Challenge <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

      </div>
    </div>
  );
}
