import { useState, useEffect } from 'react';
import { Trophy, Zap, Recycle, Wrench, Calendar, Loader2, TrendingUp } from 'lucide-react';
import { getMyKarma, getLeaderboard, getPlatformImpact } from '../services/communityService';
import toast from 'react-hot-toast';

const BADGE_BG = { first_step: 'bg-green-50 border-green-200', recycler: 'bg-emerald-50 border-emerald-200', repair_helper: 'bg-orange-50 border-orange-200', community_builder: 'bg-blue-50 border-blue-200', reuse_champion: 'bg-teal-50 border-teal-200', waste_warrior: 'bg-red-50 border-red-200', circular_leader: 'bg-amber-50 border-amber-200' };

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
        setLeaderboard(l.data.data);
        setPlatform(p.data.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">EcoKarma & Impact</h1>
        <p className="text-gray-500 text-sm mt-1">Real impact from your circular actions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[['personal', 'My Impact'], ['leaderboard', 'Leaderboard'], ['platform', 'Platform']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'personal' && karma && (
        <div className="space-y-6">
          {/* Karma total */}
          <div className="p-6 bg-gray-900 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total EcoKarma</p>
                <p className="text-5xl font-bold mt-1">{karma.ecoKarmaTotal.toLocaleString()}</p>
              </div>
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{karma.disclaimer}</p>
          </div>

          {/* Impact stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Recycle, label: 'Items Recirculated', value: karma.impact.listingsCompleted, color: 'emerald' },
              { icon: Wrench, label: 'Repairs Completed', value: karma.impact.repairsDone, color: 'orange' },
              { icon: Zap, label: 'Waste Deposited (kg)', value: karma.impact.totalKgDeposited, color: 'blue' },
              { icon: Calendar, label: 'Events Joined', value: karma.impact.eventsJoined, color: 'purple' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <s.icon className={`w-7 h-7 text-${s.color}-500 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          {karma.badges.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Badges Earned
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {karma.badges.map(b => (
                  <div key={b.id} className={`p-3 rounded-xl border text-center ${BADGE_BG[b.id] || 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-3xl mb-1">{b.icon}</div>
                    <p className="text-xs font-semibold text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Karma log */}
          {karma.logs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">EcoKarma History</h2>
              <div className="space-y-2">
                {karma.logs.slice(0, 10).map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.description || l.reason.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString('en')}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+{l.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Top EcoKarma</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {leaderboard.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-4 p-4 ${i < 3 ? 'bg-amber-50/50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-amber-700/60 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {u.avatar ? <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" /> : <span className="text-sm font-bold text-emerald-700">{u.name[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.city || 'Indonesia'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{(u.ecoKarmaTotal || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">karma</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'platform' && platform && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: platform.totalUsers },
              { label: 'Listings Completed', value: platform.totalListingsCompleted },
              { label: 'Repairs Completed', value: platform.totalRepairsCompleted },
              { label: 'Waste Managed (kg est.)', value: `${platform.totalWasteDepositedKg} kg` },
              { label: 'Events Completed', value: platform.totalEventsCompleted },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            ⚠️ {platform.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
