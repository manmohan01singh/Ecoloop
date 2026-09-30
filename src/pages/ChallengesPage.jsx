import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { getChallenges, joinChallenge } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  active: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_LABEL = { active: 'Active', upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    getChallenges().then(r => setChallenges(r.data.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    if (!isAuthenticated()) { toast.error('Please log in first'); return; }
    try {
      await joinChallenge(id);
      toast.success('Successfully joined!');
      setChallenges(cs => cs.map(c => c.id === id ? { ...c, isJoined: true, participantCount: c.participantCount + 1 } : c));
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const getProgress = (c) => Math.min(100, (parseFloat(c.currentValue) / parseFloat(c.goalValue)) * 100);
  const formatGoal = (c) => {
    const labels = { weight_kg: 'kg', items_count: 'items', actions_count: 'actions', events_count: 'events' };
    return `${parseFloat(c.currentValue).toLocaleString()} / ${parseFloat(c.goalValue).toLocaleString()} ${labels[c.goalType] || ''}`;
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
          <p className="text-gray-500 text-sm mt-1">Waste, recycling, and circular action competitions</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {challenges.map(c => {
          const progress = getProgress(c);
          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" /> +{c.ecoKarmaReward} karma
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug">{c.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{c.description}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>{formatGoal(c)}</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.participantCount} participants</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />until {new Date(c.endDate).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                {c.isJoined ? (
                  <Link to={`/challenges/${c.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl text-sm border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Already Joined
                  </Link>
                ) : c.status === 'active' || c.status === 'upcoming' ? (
                  <button onClick={() => handleJoin(c.id)}
                    className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-sm hover:bg-emerald-700 transition-colors">
                    Join Challenge
                  </button>
                ) : (
                  <Link to={`/challenges/${c.id}`}
                    className="flex items-center justify-center w-full py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm">
                    View Details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No active challenges yet</p>
        </div>
      )}
    </div>
  );
}
