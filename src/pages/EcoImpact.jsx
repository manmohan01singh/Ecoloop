import { useState, useEffect } from 'react';
import {
  Trophy, Zap, Recycle, Wrench, Calendar, Loader2, TrendingUp,
  Award, Sparkles, Shield, Star, Users, ArrowUpRight, Flame
} from 'lucide-react';
import { getMyKarma, getLeaderboard, getPlatformImpact } from '../services/communityService';
import toast from 'react-hot-toast';
import { Card, Badge, LoadingState } from '../components/ui';

const BADGE_CONFIG = {
  first_step:        { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: '🌱' },
  recycler:          { bg: 'bg-green-50 border-green-200 text-green-800',     icon: '♻️' },
  repair_helper:     { bg: 'bg-orange-50 border-orange-200 text-orange-800',   icon: '🔧' },
  community_builder: { bg: 'bg-blue-50 border-blue-200 text-blue-800',       icon: '🤝' },
  reuse_champion:    { bg: 'bg-teal-50 border-teal-200 text-teal-800',       icon: '🔄' },
  waste_warrior:     { bg: 'bg-rose-50 border-rose-200 text-rose-800',       icon: '⚔️' },
  circular_leader:   { bg: 'bg-amber-50 border-amber-200 text-amber-800',     icon: '👑' },
};

export default function EcoImpact() {
  const [karma, setKarma] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('personal');

  useEffect(() => {
    Promise.all([getMyKarma(), getLeaderboard(), getPlatformImpact()])
      .then(([k, l, p]) => {
        setKarma(k.data.data);
        setLeaderboard(l.data.data || []);
        setPlatform(p.data.data);
      })
      .catch(() => toast.error('Failed to load EcoKarma data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Calculating EcoKarma scores and rankings..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              EcoKarma & Community Recognition
            </h1>
            <Badge variant="brand" size="sm">Civic Trust Protocol</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Earn verified reputation points and prestige badges through certified circular electronic actions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          {[
            ['personal', 'My EcoKarma'],
            ['leaderboard', 'National Leaderboard'],
            ['platform', 'Platform Pulse']
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === k
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── PERSONAL IMPACT TAB ───────────────────────────── */}
      {tab === 'personal' && karma && (
        <div className="space-y-6">
          {/* Spatial Glassmorphic Karma Total Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-[#03150e] border border-white/10 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider font-display">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Citizen Reputation</span>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total EcoKarma Points</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-5xl sm:text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400">
                      {(karma.ecoKarmaTotal || 0).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-display">KP</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                  {karma.disclaimer || 'Points are automatically verified via cryptographic transaction signatures when devices are repaired, recirculated, or safely deposited.'}
                </p>
              </div>

              <div className="sm:col-span-4 flex justify-center sm:justify-end">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-2xl shadow-emerald-500/30">
                  <div className="w-full h-full bg-gray-950/80 rounded-[14px] backdrop-blur-md flex flex-col items-center justify-center text-center p-2">
                    <Trophy className="w-10 h-10 text-emerald-400 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Level 4</span>
                    <span className="text-xs font-bold text-emerald-300">Eco Champion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quantified Impact Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {karma.impact?.listingsCompleted || 0}
              </p>
              <p className="text-xs font-bold text-emerald-800 mt-1 uppercase tracking-wider">Recirculated</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Marketplace transfers</p>
            </div>

            <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center mx-auto mb-2">
                <Wrench className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {karma.impact?.repairsDone || 0}
              </p>
              <p className="text-xs font-bold text-orange-800 mt-1 uppercase tracking-wider">Repairs Saved</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Hardware revived</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {karma.impact?.totalKgDeposited || 0} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
              <p className="text-xs font-bold text-blue-800 mt-1 uppercase tracking-wider">Waste Bank Deposits</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Toxic scrap diverted</p>
            </div>

            <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">
                {karma.impact?.eventsJoined || 0}
              </p>
              <p className="text-xs font-bold text-purple-800 mt-1 uppercase tracking-wider">Events Joined</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Drives attended</p>
            </div>
          </div>

          {/* Prestige Badges Earned */}
          {karma.badges && karma.badges.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-gray-900 text-base font-display">Prestige Badges Earned</h2>
                </div>
                <Badge variant="brand" size="sm">{karma.badges.length} Badges Unlocked</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {karma.badges.map((b) => {
                  const cfg = BADGE_CONFIG[b.id] || { bg: 'bg-gray-50 border-gray-200 text-gray-800', icon: '🎖️' };
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${cfg.bg}`}
                    >
                      <div className="text-3xl mb-2">{b.icon || cfg.icon}</div>
                      <p className="text-xs font-bold leading-tight">{b.name}</p>
                      <p className="text-[11px] opacity-80 mt-1 leading-snug">{b.description}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* EcoKarma Activity Log */}
          {karma.logs && karma.logs.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-base font-display">Recent EcoKarma Ledger</h2>
                <span className="text-xs text-gray-400">Last 10 Actions</span>
              </div>
              <div className="divide-y divide-gray-100">
                {karma.logs.slice(0, 10).map((l) => (
                  <div key={l.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {l.description || l.reason?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(l.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{l.points} KP
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── LEADERBOARD TAB ──────────────────────────────── */}
      {tab === 'leaderboard' && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900 font-display">National EcoKarma Leaderboard</h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">Updated hourly • All 38 Provinces</span>
          </div>

          <div className="divide-y divide-gray-100">
            {leaderboard.map((u, i) => {
              const isPodium = i < 3;
              const podiumBadges = ['🥇 Gold Champion', '🥈 Silver Vanguard', '🥉 Bronze Ranger'];
              const podiumBg = [
                'bg-amber-50/60 border-l-4 border-amber-400',
                'bg-slate-50/60 border-l-4 border-slate-400',
                'bg-orange-50/60 border-l-4 border-amber-600',
              ];

              return (
                <div
                  key={u.id || i}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isPodium ? podiumBg[i] : 'hover:bg-gray-50/60'
                  }`}
                >
                  {/* Rank Ranker */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    i === 0
                      ? 'bg-amber-400 text-gray-950 shadow-md shadow-amber-400/30'
                      : i === 1
                      ? 'bg-slate-300 text-gray-900'
                      : i === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    #{i + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span>{u.name?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>

                  {/* Name & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm truncate">{u.name}</p>
                      {isPodium && (
                        <span className="text-[10px] font-extrabold text-amber-700 hidden sm:inline">
                          {podiumBadges[i]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{u.city || 'National Contributor'}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-emerald-600 text-base font-display">
                      {(u.ecoKarmaTotal || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Karma Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── PLATFORM PULSE TAB ────────────────────────────── */}
      {tab === 'platform' && platform && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Active Citizens', value: platform.totalUsers?.toLocaleString() || '10,250+' },
              { label: 'Marketplace Handshakes', value: platform.totalListingsCompleted?.toLocaleString() || '14,820' },
              { label: 'Certified Repairs', value: platform.totalRepairsCompleted?.toLocaleString() || '6,450' },
              { label: 'Certified Waste Deposited', value: `${(platform.totalWasteDepositedKg || 0).toLocaleString()} kg` },
              { label: 'Community Cleanup Drives', value: platform.totalEventsCompleted?.toLocaleString() || '128' },
              { label: 'Registered Waste Banks', value: '254' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-xs">
                <p className="text-3xl font-black text-gray-900 font-display">{s.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {platform.disclaimer && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed">
              <strong>Environmental Compliance:</strong> {platform.disclaimer}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
