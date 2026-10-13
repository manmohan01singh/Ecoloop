import { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Users, Calendar, CheckCircle, Search, Target,
  Sparkles, Award, ArrowRight, ShieldCheck, Flame, X
} from 'lucide-react';
import { getChallenges, joinChallenge } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Badge, Modal, EmptyState, LoadingState, StatCard, Card, ProgressBar } from '../components/ui';

const STATUS_STYLE = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  upcoming: 'bg-blue-50 text-blue-800 border-blue-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL = {
  active: 'Active Challenge',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [joining, setJoining] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchChallenges = () => {
    getChallenges()
      .then(r => setChallenges(r.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoin = async (id) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to join civic eco challenges');
      return;
    }
    setJoining(true);
    try {
      await joinChallenge(id);
      toast.success('Joined challenge! Your circular actions now count towards rewards.');
      setChallenges(cs => cs.map(c => c.id === id ? { ...c, isJoined: true, participantCount: (c.participantCount || 0) + 1 } : c));
      if (selectedChallenge?.id === id) {
        setSelectedChallenge(c => ({ ...c, isJoined: true, participantCount: (c.participantCount || 0) + 1 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const getProgress = (c) => Math.min(100, (parseFloat(c.currentValue || 0) / Math.max(1, parseFloat(c.goalValue || 1))) * 100);

  const formatGoal = (c) => {
    const labels = { weight_kg: 'kg', items_count: 'devices', actions_count: 'actions', events_count: 'events' };
    const cur = parseFloat(c.currentValue || 0).toLocaleString();
    const target = parseFloat(c.goalValue || 0).toLocaleString();
    return `${cur} / ${target} ${labels[c.goalType] || 'units'}`;
  };

  // Filtered challenges
  const filtered = useMemo(() => {
    return challenges.filter(c => {
      const matchTab = activeTab === 'all' || c.status === activeTab;
      const matchSearch = !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [challenges, activeTab, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter(c => c.status === 'active').length;
    const karmaPool = challenges.reduce((sum, c) => sum + (c.ecoKarmaReward || 0), 0);
    const totalParticipants = challenges.reduce((sum, c) => sum + (c.participantCount || 0), 0);
    return { total, active, karmaPool, totalParticipants };
  }, [challenges]);

  if (loading) return <LoadingState size="lg" fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Eco Challenges & Quests
            </h1>
            <Badge variant="brand" size="sm">Civic Action</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Compete with communities across Indonesia to divert e-waste, earn EcoKarma, and claim partner rewards.
          </p>
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Competitions"
          value={stats.active}
          icon={Flame}
          color="emerald"
          caption={`${stats.total} total nationwide challenges`}
        />
        <StatCard
          label="Karma Reward Pool"
          value={`+${stats.karmaPool.toLocaleString()}`}
          icon={Trophy}
          color="amber"
          caption="Points eligible for merchant rewards"
        />
        <StatCard
          label="Participants Enrolled"
          value={stats.totalParticipants.toLocaleString()}
          icon={Users}
          color="teal"
          caption="Citizens and organizations active"
        />
        <StatCard
          label="Target Milestones"
          value="100% Verified"
          icon={Target}
          color="blue"
          caption="Monitored via recycling weigh-ins"
        />
      </div>

      {/* ── CONTROLS & FILTER TABS ────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Quests' },
              { id: 'active', label: 'Active Now' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Finished' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── CHALLENGES GRID ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={challenges.length === 0 ? "No active challenges" : "No challenges match filter"}
          description={
            challenges.length === 0
              ? "New e-waste collection and repair challenges are announced monthly. Check back soon!"
              : "Try switching tabs or clearing your search keywords."
          }
          action={challenges.length > 0 ? {
            label: 'Reset Filters',
            onClick: () => { setActiveTab('all'); setSearchQuery(''); },
            variant: 'secondary'
          } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const progress = getProgress(c);
            const isJoinable = c.status === 'active' || c.status === 'upcoming';

            return (
              <div
                key={c.id}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-5 pb-4">
                  {/* Top status & reward */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[c.status] || STATUS_STYLE.active}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                      +{c.ecoKarmaReward} Karma
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1.5 text-base font-display leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Progress section */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>{formatGoal(c)}</span>
                      <span className="text-emerald-700">{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar value={progress} max={100} size="sm" variant={progress >= 100 ? 'success' : 'primary'} />
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {c.participantCount || 0} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Until {new Date(c.endDate).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChallenge(c)}
                      className="w-full text-xs"
                    >
                      View Details
                    </Button>

                    {c.isJoined ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        icon={CheckCircle}
                        className="w-full bg-emerald-50 text-emerald-800 text-xs font-bold"
                      >
                        Enrolled
                      </Button>
                    ) : isJoinable ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoin(c.id)}
                        disabled={joining}
                        className="w-full text-xs font-bold"
                      >
                        Join Quest
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-full text-xs"
                      >
                        Concluded
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CHALLENGE DETAIL MODAL ─────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedChallenge)}
        onClose={() => setSelectedChallenge(null)}
        title={selectedChallenge?.title || 'Challenge Details'}
        size="md"
      >
        {selectedChallenge && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[selectedChallenge.status] || STATUS_STYLE.active}`}>
                {STATUS_LABEL[selectedChallenge.status]}
              </span>
              <span className="text-sm font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                +{selectedChallenge.ecoKarmaReward} Karma Reward
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Community Progress</span>
                <span className="text-emerald-700 font-extrabold">{Math.round(getProgress(selectedChallenge))}%</span>
              </div>
              <ProgressBar value={getProgress(selectedChallenge)} max={100} size="md" />
              <p className="text-xs text-gray-500 text-right">{formatGoal(selectedChallenge)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 p-3 bg-white border border-gray-200 rounded-xl">
              <div>
                <span className="text-gray-400 block mb-0.5">Start Date</span>
                <span className="font-semibold">{new Date(selectedChallenge.startDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">End Date</span>
                <span className="font-semibold">{new Date(selectedChallenge.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2">
              {selectedChallenge.isJoined ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  You are participating in this quest. Every qualifying deposit or repair is credited automatically.
                </div>
              ) : selectedChallenge.status === 'active' || selectedChallenge.status === 'upcoming' ? (
                <Button
                  onClick={() => handleJoin(selectedChallenge.id)}
                  disabled={joining}
                  loading={joining}
                  icon={Sparkles}
                  size="lg"
                  className="w-full font-bold shadow-md shadow-emerald-600/20"
                >
                  Join Challenge Now (+{selectedChallenge.ecoKarmaReward} Karma)
                </Button>
              ) : (
                <p className="text-xs text-gray-400 text-center">This challenge has ended.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
