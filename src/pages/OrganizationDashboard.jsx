import { useState, useEffect } from 'react';
import { Building2, Users, Trophy, Calendar, TrendingUp, Plus, BarChart3, Target, Award, Loader2 } from 'lucide-react';
import { getOrganizationStats, getMyKarma } from '../services/communityService';
import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

export default function OrganizationDashboard() {
  const { user } = useAuthStore();
  const [orgData, setOrgData] = useState(null);
  const [karma, setKarma] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [orgRes, karmaRes] = await Promise.all([
          getOrganizationStats(),
          getMyKarma(),
        ]);
        setOrgData(orgRes.data.data);
        setKarma(karmaRes.data.data);
      } catch (err) {
        toast.error('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Redirect if not organization
  if (user?.role !== 'organization') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = orgData?.stats || {};
  const challenges = orgData?.challenges || [];
  const events = orgData?.events || [];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
            <p className="text-gray-500">Manage your environmental initiatives</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-xl border border-indigo-200">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.challengesCreated || 0}</div>
          <div className="text-xs text-gray-500">Challenges Created</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-indigo-200">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.eventsHosted || 0}</div>
          <div className="text-xs text-gray-500">Events Hosted</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-indigo-200">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalParticipants || 0}</div>
          <div className="text-xs text-gray-500">Total Participants</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-indigo-200">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{user.ecoKarmaTotal || 0}</div>
          <div className="text-xs text-gray-500">EcoKarma Impact</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Challenges */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                Your Challenges
              </h2>
              <Link to="/challenges?action=create"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                <Plus className="w-4 h-4" /> Create Challenge
              </Link>
            </div>

            {challenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No challenges created yet</p>
                <Link to="/challenges?action=create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  <Plus className="w-4 h-4" /> Create Your First Challenge
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map(challenge => {
                  const progress = (challenge.currentValue / challenge.goalValue) * 100;
                  return (
                    <div key={challenge.id} className="p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              challenge.status === 'active' ? 'bg-green-100 text-green-700' :
                              challenge.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {challenge.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {challenge.participantCount} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {challenge.currentValue}/{challenge.goalValue} {challenge.goalType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 relative">
                            <svg className="transform -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                              <circle cx="32" cy="32" r="28" fill="none" stroke="#8b5cf6" strokeWidth="4" 
                                strokeLinecap="round" 
                                strokeDasharray={`${(progress / 100) * 176} 176`} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Your Events
              </h2>
              <Link to="/events?action=create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Create Event
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No events hosted yet</p>
                <Link to="/events?action=create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus className="w-4 h-4" /> Host Your First Event
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <Link key={event.id} to={`/events/${event.id}`}
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                            event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                            event.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.participantCount}/{event.capacity || '∞'} participants
                          </span>
                          <span>{new Date(event.startDate).toLocaleDateString('en')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Impact Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Total Impact</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold mb-1">{stats.totalParticipants || 0}</div>
                <div className="text-indigo-100 text-sm">People Engaged</div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                <div>
                  <div className="text-xl font-bold">{stats.activeChallenges || 0}</div>
                  <div className="text-indigo-100 text-xs">Active Challenges</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{stats.upcomingEvents || 0}</div>
                  <div className="text-indigo-100 text-xs">Upcoming Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/challenges?action=create"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
                Create Challenge
              </Link>
              <Link to="/events?action=create"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                Host Event
              </Link>
              <Link to="/eco-impact"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                View Analytics
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Organization Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span>•</span>
                <span>Create engaging challenges to boost participation</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Host regular events to build community</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Share results to show impact</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Collaborate with other organizations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
