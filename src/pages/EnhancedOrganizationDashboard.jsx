import { useState, useEffect } from 'react';
import { Building2, Users, Trophy, Calendar, TrendingUp, Plus, BarChart3, Target, Award, Loader2, RefreshCw, MapPin, Clock, CheckCircle, Star, Activity, FileText, Eye, Edit2, XCircle } from 'lucide-react';
import * as organizationService from '../services/organizationService';
import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  ongoing: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function EnhancedOrganizationDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [impactSummary, setImpactSummary] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [period, setPeriod] = useState('30d');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getOrganizationDashboard();
      setDashboardData(res.data.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await organizationService.getOrganizationAnalytics({ period });
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getMyChallenges();
      setChallenges(res.data.data || []);
    } catch (error) {
      console.log('Challenges data not available yet');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getMyEvents();
      setEvents(res.data.data || []);
    } catch (error) {
      console.log('Events data not available yet');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadImpactSummary = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getImpactSummary();
      setImpactSummary(res.data.data);
    } catch (error) {
      console.log('Impact summary not available yet');
      setImpactSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'challenges') {
      loadChallenges();
    } else if (activeTab === 'events') {
      loadEvents();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'impact') {
      loadImpactSummary();
    }
  }, [activeTab, period]);

  if (!['organization', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleUpdateEventResults = async (eventId, results) => {
    try {
      await organizationService.updateEventResults(eventId, results);
      toast.success('Event results updated');
      loadEvents();
      loadDashboard();
      setShowResultsModal(false);
    } catch (error) {
      toast.error('Failed to update results');
    }
  };

  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organization Hub</h1>
                <p className="text-sm text-gray-500">Environmental Initiatives & Community Impact</p>
              </div>
            </div>
            <button onClick={() => { loadDashboard(); loadChallenges(); loadEvents(); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'challenges', label: 'Challenges', icon: Trophy },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'impact', label: 'Impact Report', icon: Award },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            stats={stats}
            dashboardData={dashboardData}
            user={user}
            setActiveTab={setActiveTab}
            onViewChallenge={(c) => { setSelectedItem(c); setShowModal(true); }}
            onViewEvent={(e) => { setSelectedItem(e); setShowModal(true); }}
          />
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <ChallengesTab 
            challenges={challenges}
            loading={loading}
            onView={(c) => { setSelectedItem(c); setShowModal(true); }}
          />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsTab 
            events={events}
            loading={loading}
            onView={(e) => { setSelectedItem(e); setShowModal(true); }}
            onUpdateResults={(e) => { setSelectedItem(e); setShowResultsModal(true); }}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            analytics={analytics}
            period={period}
            setPeriod={setPeriod}
            stats={stats}
          />
        )}

        {/* Impact Report Tab */}
        {activeTab === 'impact' && (
          <ImpactTab 
            impactSummary={impactSummary}
            loading={loading}
          />
        )}

        {/* Details Modal */}
        {showModal && selectedItem && (
          <DetailsModal 
            item={selectedItem}
            onClose={() => { setShowModal(false); setSelectedItem(null); }}
          />
        )}

        {/* Results Modal */}
        {showResultsModal && selectedItem && (
          <ResultsModal 
            event={selectedItem}
            onClose={() => { setShowResultsModal(false); setSelectedItem(null); }}
            onSubmit={handleUpdateEventResults}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats, dashboardData, user, setActiveTab, onViewChallenge, onViewEvent }) {
  const challenges = dashboardData?.challenges || [];
  const events = dashboardData?.events || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Active Challenges" value={stats.activeChallenges || 0} color="purple" trend="+3" />
        <StatCard icon={Calendar} label="Upcoming Events" value={stats.upcomingEvents || 0} color="blue" trend="+5" />
        <StatCard icon={Users} label="Total Participants" value={stats.totalParticipants || 0} color="emerald" trend="+142" />
        <StatCard icon={Award} label="Material Collected" value={`${(stats.totalMaterialCollected || 0).toFixed(1)} kg`} color="amber" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Challenges Created</p>
              <p className="text-3xl font-bold text-gray-900">{stats.challengesCreated || 0}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.completedChallenges || 0} completed</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link to="/challenges?action=create"
            className="text-sm text-purple-600 hover:underline font-medium flex items-center gap-1">
            Create Challenge <Plus className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Events Hosted</p>
              <p className="text-3xl font-bold text-gray-900">{stats.eventsHosted || 0}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.completedEvents || 0} completed</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link to="/events?action=create"
            className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
            Host Event <Plus className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">EcoKarma Impact</p>
              <p className="text-3xl font-bold text-gray-900">{user?.ecoKarmaTotal || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Organization score</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <Link to="/eco-impact"
            className="text-sm text-amber-600 hover:underline font-medium">
            View Impact
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => onViewEvent(event)}>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.participantCount || 0} joined
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.city}
                    </span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {challenges.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              Recent Challenges
            </h3>
            <Link to="#" onClick={() => setActiveTab('challenges')} 
              className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {challenges.slice(0, 3).map(challenge => {
              const progress = (challenge.currentValue / challenge.goalValue) * 100;
              return (
                <div key={challenge.id} 
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors border border-purple-100"
                  onClick={() => onViewChallenge(challenge)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[challenge.status]}`}>
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
                    <div className="text-center flex-shrink-0">
                      <div className="w-16 h-16 relative">
                        <svg className="transform -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#a855f7" strokeWidth="4" 
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
        </div>
      )}

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white shadow-lg">
        <Building2 className="w-8 h-8 text-emerald-200 mb-3" />
        <h3 className="font-bold text-xl mb-2">Organization Impact Platform</h3>
        <p className="text-emerald-100 mb-4">
          Create engaging challenges and host impactful events to drive environmental action in your community. 
          Track participation, measure results, and showcase your organization's positive impact.
        </p>
        <div className="flex gap-3">
          <Link to="/challenges?action=create"
            className="px-4 py-2 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Create Challenge
          </Link>
          <Link to="/events?action=create"
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Host Event
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, trend }) {
  const colors = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
      </div>
    </div>
  );
}

// Challenges Tab
function ChallengesTab({ challenges, loading, onView }) {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (challenges.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg mb-2">No challenges created yet</p>
        <p className="text-gray-400 text-sm mb-4">Create your first challenge to engage the community</p>
        <Link to="/challenges?action=create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          <Plus className="w-4 h-4" /> Create Challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {challenges.map(challenge => {
        const progress = (challenge.currentValue / challenge.goalValue) * 100;
        return (
          <div key={challenge.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 relative flex-shrink-0">
                <svg className="transform -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#a855f7" strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeDasharray={`${(progress / 100) * 176} 176`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{challenge.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_COLORS[challenge.status]}`}>
                    {challenge.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {challenge.participantCount} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {challenge.currentValue}/{challenge.goalValue} {challenge.goalType.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button onClick={() => onView(challenge)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  <Link to={`/challenges/${challenge.id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" /> View Participants
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Events Tab
function EventsTab({ events, loading, onView, onUpdateResults }) {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg mb-2">No events hosted yet</p>
        <p className="text-gray-400 text-sm mb-4">Host your first event to bring the community together</p>
        <Link to="/events?action=create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Host Event
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map(event => (
        <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_COLORS[event.status]}`}>
                  {event.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.participantCount}/{event.capacity || '∞'} participants
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.city}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">{event.type.replace('_', ' ')}</span>
              </div>

              {event.status === 'completed' && event.resultsVerified && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-green-900 mb-2">✓ Results Verified</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                    <span>{event.resultParticipants} participants</span>
                    <span>{event.resultMaterialKg} kg collected</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button onClick={() => onView(event)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </button>
                <Link to={`/events/${event.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" /> Participants
                </Link>
                {event.status === 'completed' && (
                  <button onClick={() => onUpdateResults(event)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {event.resultsVerified ? 'Edit' : 'Add'} Results
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ analytics, period, setPeriod, stats }) {
  if (!analytics) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Analytics Period</h3>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Challenges</p>
          <p className="text-2xl font-bold text-gray-900">{stats.challengesCreated || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.activeChallenges || 0} active</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{stats.eventsHosted || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.upcomingEvents || 0} upcoming</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Participants</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Material Collected</p>
          <p className="text-2xl font-bold text-gray-900">{(stats.totalMaterialCollected || 0).toFixed(1)} kg</p>
        </div>
      </div>

      {/* Events by Type */}
      {analytics.eventsByType && analytics.eventsByType.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Events by Type
          </h3>
          <div className="space-y-3">
            {analytics.eventsByType.map(item => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.type.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-500">{item.count} events · {item.totalParticipants} participants</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: `${(item.totalParticipants / Math.max(...analytics.eventsByType.map(i => i.totalParticipants))) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Analytics Insights</h4>
            <p className="text-sm text-gray-600">
              Track your organization's impact over time. Monitor participation growth, event success rates, 
              and environmental outcomes to optimize your community engagement strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Impact Report Tab
function ImpactTab({ impactSummary, loading }) {
  if (loading || !impactSummary) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  const totalImpact = impactSummary.totalImpact || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <Trophy className="w-8 h-8 text-purple-200 mb-2" />
          <p className="text-2xl font-bold mb-1">{totalImpact.challengesCompleted || 0}</p>
          <p className="text-purple-100 text-sm">Challenges Completed</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <Calendar className="w-8 h-8 text-blue-200 mb-2" />
          <p className="text-2xl font-bold mb-1">{totalImpact.eventsCompleted || 0}</p>
          <p className="text-blue-100 text-sm">Events Completed</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <Users className="w-8 h-8 text-emerald-200 mb-2" />
          <p className="text-2xl font-bold mb-1">{totalImpact.totalParticipants || 0}</p>
          <p className="text-emerald-100 text-sm">Total Participants</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <Target className="w-8 h-8 text-amber-200 mb-2" />
          <p className="text-2xl font-bold mb-1">{(totalImpact.totalMaterialKg || 0).toFixed(1)}</p>
          <p className="text-amber-100 text-sm">Material Collected (kg)</p>
        </div>
      </div>

      {/* Completed Events */}
      {impactSummary.completedEvents && impactSummary.completedEvents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Events Impact
          </h3>
          <div className="space-y-3">
            {impactSummary.completedEvents.map(event => (
              <div key={event.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{event.type.replace('_', ' ')} · {new Date(event.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold text-gray-900">{event.resultParticipants || 0}</p>
                    <p className="text-xs text-gray-500">Participants</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold text-gray-900">{(event.resultMaterialKg || 0).toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Material (kg)</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold text-gray-900">{event.resultItemsRepaired || event.resultItemsReused || 0}</p>
                    <p className="text-xs text-gray-500">Items Saved</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">Share Your Impact</h3>
            <p className="text-emerald-100 mb-4">
              Download and share your organization's environmental impact report with stakeholders, 
              partners, and the community.
            </p>
            <button className="px-4 py-2 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
              Download Report
            </button>
          </div>
          <Award className="w-16 h-16 text-emerald-200 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

// Details Modal
function DetailsModal({ item, onClose }) {
  const isChallenge = 'goalValue' in item;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{isChallenge ? 'Challenge' : 'Event'} Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{isChallenge ? 'Status' : 'Event Status'}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[item.status]}`}>
                {item.status}
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Participants</p>
              <p className="font-semibold text-gray-900">{item.participantCount || 0}</p>
            </div>
            {isChallenge ? (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Goal</p>
                  <p className="font-semibold text-gray-900">{item.goalValue} {item.goalType.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Current Progress</p>
                  <p className="font-semibold text-gray-900">{item.currentValue} ({Math.round((item.currentValue / item.goalValue) * 100)}%)</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{new Date(item.startDate).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{item.city}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Link to={isChallenge ? `/challenges/${item.id}` : `/events/${item.id}`}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-center">
              View Full Page
            </Link>
            <button onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Modal
function ResultsModal({ event, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    resultParticipants: event.resultParticipants || '',
    resultMaterialKg: event.resultMaterialKg || '',
    resultItemsRepaired: event.resultItemsRepaired || '',
    resultItemsReused: event.resultItemsReused || '',
    resultsVerified: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(event.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Update Event Results</h3>
          <p className="text-sm text-gray-500 mt-1">{event.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Participants
            </label>
            <input
              type="number"
              value={formData.resultParticipants}
              onChange={(e) => setFormData({ ...formData, resultParticipants: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Collected (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.resultMaterialKg}
              onChange={(e) => setFormData({ ...formData, resultMaterialKg: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 125.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Repaired
            </label>
            <input
              type="number"
              value={formData.resultItemsRepaired}
              onChange={(e) => setFormData({ ...formData, resultItemsRepaired: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Reused/Swapped
            </label>
            <input
              type="number"
              value={formData.resultItemsReused}
              onChange={(e) => setFormData({ ...formData, resultItemsReused: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 40"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.resultsVerified}
              onChange={(e) => setFormData({ ...formData, resultsVerified: e.target.checked })}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="verified" className="text-sm text-gray-700">
              Mark results as verified
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              Save Results
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
