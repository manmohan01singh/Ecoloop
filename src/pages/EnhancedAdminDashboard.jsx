import { useState, useEffect } from 'react';
import { Users, FileText, Package, AlertTriangle, CheckCircle, Loader2, Shield, MapPin, Wrench, Building2, TrendingUp, Award, Search, Eye, BarChart3, Briefcase, Calendar, Recycle, Flag, Activity } from 'lucide-react';
import { getAdminDashboard, getAdminUsers, updateAdminUser, getPendingLocations, verifyLocationAdmin, getPendingProviders, verifyProvider, getPendingReports, updateReportStatus, getUserContributions } from '../services/communityService';
import { getComprehensiveDashboard, getAllMaterials, getAllChallenges, getAllEvents, getAllRepairs, getAllDeposits, getAllReports as getAllReportsComprehensive, getPlatformAnalytics } from '../services/adminComprehensiveService';
import useAuthStore from '../context/authStore';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';
import ApplicationQueueTab from '../components/admin/ApplicationQueueTab';

const STATUS_STYLE = { reported: 'bg-yellow-100 text-yellow-700', under_review: 'bg-blue-100 text-blue-700', verified: 'bg-purple-100 text-purple-700', resolved: 'bg-green-100 text-green-700', rejected: 'bg-gray-100 text-gray-600' };

export default function EnhancedAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [reports, setReports] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContributions, setUserContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 'overview') {
          const [oldDash, compDash] = await Promise.all([
            getAdminDashboard(),
            getComprehensiveDashboard()
          ]);
          setData(oldDash.data.data);
          setComprehensiveData(compDash.data.data);
        } else if (tab === 'users') {
          const r = await getAdminUsers({ limit: 50 });
          setUsers(r.data.data.items);
        } else if (tab === 'contributions') {
          const r = await getAdminUsers({ limit: 50 });
          setUsers(r.data.data.items);
        } else if (tab === 'locations') {
          const r = await getPendingLocations();
          setLocations(r.data.data);
        } else if (tab === 'providers') {
          const r = await getPendingProviders();
          setProviders(r.data.data);
        } else if (tab === 'reports') {
          const r = await getPendingReports();
          setReports(r.data.data);
        } else if (tab === 'materials') {
          const r = await getAllMaterials({ page: currentPage, limit: 20 });
          setMaterials(r.data.data.materials);
        } else if (tab === 'challenges') {
          const r = await getAllChallenges({ page: currentPage, limit: 20 });
          setChallenges(r.data.data.challenges);
        } else if (tab === 'events') {
          const r = await getAllEvents({ page: currentPage, limit: 20 });
          setEvents(r.data.data.events);
        } else if (tab === 'repairs') {
          const r = await getAllRepairs({ page: currentPage, limit: 20 });
          setRepairs(r.data.data.requests);
        } else if (tab === 'deposits') {
          const r = await getAllDeposits({ page: currentPage, limit: 20 });
          setDeposits(r.data.data.deposits);
        } else if (tab === 'analytics') {
          const r = await getPlatformAnalytics({ period: '30d' });
          setAnalytics(r.data.data);
        }
      } catch (err) {
        toast.error('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, currentPage]);

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  const handleVerifyLocation = async (id, status) => {
    try {
      await verifyLocationAdmin(id, status);
      toast.success(`Location ${status}`);
      setLocations(ls => ls.filter(l => l.id !== id));
    } catch { toast.error('Failed'); }
  };

  const handleVerifyProvider = async (id, status) => {
    try {
      await verifyProvider(id, status);
      toast.success(`Provider ${status}`);
      setProviders(ps => ps.filter(p => p.id !== id));
    } catch { toast.error('Failed'); }
  };

  const handleUpdateReport = async (id, status, adminNote = '') => {
    try {
      await updateReportStatus(id, { status, adminNote });
      toast.success('Report status updated');
      setReports(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    } catch { toast.error('Failed'); }
  };

  const handleViewContributions = async (userId) => {
    try {
      setLoading(true);
      const r = await getUserContributions(userId);
      setUserContributions(r.data.data);
      setSelectedUser(userId);
    } catch (err) {
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    ['overview', 'Overview'],
    ['users', 'Users'],
    ['contributions', 'Contributions'],
    ['materials', 'Materials'],
    ['challenges', 'Challenges'],
    ['events', 'Events'],
    ['repairs', 'Repairs'],
    ['deposits', 'Deposits'],
    ['locations', 'Locations'],
    ['providers', 'Providers'],
    ['applications', 'Role Applications'],
    ['reports', 'Reports'],
    ['analytics', 'Analytics']
  ];

  // Filter users and organizations
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const organizationUsers = filteredUsers.filter(u => u.role === 'organization');
  const regularUsers = filteredUsers.filter(u => u.role !== 'organization' && u.role !== 'admin');

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage Circuvio Platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setSelectedUser(null); setUserContributions(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading && !userContributions ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
      ) : tab === 'overview' && comprehensiveData ? (
        <div className="space-y-6">
          {/* Comprehensive Stats Grid - ALL DASHBOARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalUsers}</p>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <div className="mt-3 pt-3 border-t border-blue-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Admin:</span><span className="font-semibold">{comprehensiveData.stats.adminUsers}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Moderator:</span><span className="font-semibold">{comprehensiveData.stats.moderatorUsers}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Business:</span><span className="font-semibold">{comprehensiveData.stats.businessUsers}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Organization:</span><span className="font-semibold">{comprehensiveData.stats.organizationUsers}</span></div>
              </div>
            </div>

            {/* Content Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
              <FileText className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalPosts}</p>
              <p className="text-sm text-gray-600 font-medium">Total Posts</p>
              <div className="mt-3 pt-3 border-t border-purple-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Comments:</span><span className="font-semibold">{comprehensiveData.stats.totalComments}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Devices:</span><span className="font-semibold">{comprehensiveData.stats.totalDevices}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Listings:</span><span className="font-semibold">{comprehensiveData.stats.totalListings}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Locations:</span><span className="font-semibold">{comprehensiveData.stats.totalLocations}</span></div>
              </div>
            </div>

            {/* Business Stats */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-5">
              <Briefcase className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalMaterials}</p>
              <p className="text-sm text-gray-600 font-medium">Business Materials</p>
              <div className="mt-3 pt-3 border-t border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Active:</span><span className="font-semibold">{comprehensiveData.stats.activeMaterialListings}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Requests:</span><span className="font-semibold">{comprehensiveData.stats.totalMaterialRequests}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Completed:</span><span className="font-semibold text-emerald-700">{comprehensiveData.stats.completedDeals}</span></div>
              </div>
            </div>

            {/* Organization Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-5">
              <Calendar className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalChallenges}</p>
              <p className="text-sm text-gray-600 font-medium">Challenges</p>
              <div className="mt-3 pt-3 border-t border-indigo-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Active:</span><span className="font-semibold">{comprehensiveData.stats.activeChallenges}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Events:</span><span className="font-semibold">{comprehensiveData.stats.totalEvents}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Upcoming:</span><span className="font-semibold">{comprehensiveData.stats.upcomingEvents}</span></div>
              </div>
            </div>

            {/* Repair Stats */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5">
              <Wrench className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalRepairRequests}</p>
              <p className="text-sm text-gray-600 font-medium">Repair Requests</p>
              <div className="mt-3 pt-3 border-t border-orange-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Active:</span><span className="font-semibold">{comprehensiveData.stats.activeRepairs}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Completed:</span><span className="font-semibold text-emerald-700">{comprehensiveData.stats.completedRepairs}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Providers:</span><span className="font-semibold">{comprehensiveData.stats.repairProviderUsers}</span></div>
              </div>
            </div>

            {/* Recycler Stats */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-5">
              <Recycle className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalWasteDeposits}</p>
              <p className="text-sm text-gray-600 font-medium">Waste Deposits</p>
              <div className="mt-3 pt-3 border-t border-teal-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Verified:</span><span className="font-semibold text-emerald-700">{comprehensiveData.stats.verifiedDeposits}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Weight:</span><span className="font-semibold">{comprehensiveData.stats.totalWasteKg} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Recyclers:</span><span className="font-semibold">{comprehensiveData.stats.recyclerUsers}</span></div>
              </div>
            </div>

            {/* Moderation Stats */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
              <Flag className="w-8 h-8 text-red-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalReports}</p>
              <p className="text-sm text-gray-600 font-medium">Total Reports</p>
              <div className="mt-3 pt-3 border-t border-red-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Pending:</span><span className="font-semibold text-red-700">{comprehensiveData.stats.pendingReports}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Resolved:</span><span className="font-semibold text-emerald-700">{comprehensiveData.stats.resolvedReports}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Reviews:</span><span className="font-semibold">{comprehensiveData.stats.totalReviews}</span></div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-5">
              <Activity className="w-8 h-8 text-pink-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{comprehensiveData.stats.totalKarmaActivities}</p>
              <p className="text-sm text-gray-600 font-medium">Karma Activities</p>
              <div className="mt-3 pt-3 border-t border-pink-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Notifications:</span><span className="font-semibold">{comprehensiveData.stats.totalNotifications}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Reviews:</span><span className="font-semibold">{comprehensiveData.stats.totalReviews}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Pending Verif:</span><span className="font-semibold">{comprehensiveData.stats.pendingProviders + comprehensiveData.stats.pendingLocations}</span></div>
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Growth Metrics (Last 30 Days)
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">+{comprehensiveData.stats.newUsersLastMonth}</p>
                <p className="text-sm text-gray-600">New Users</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">+{comprehensiveData.stats.newPostsLastMonth}</p>
                <p className="text-sm text-gray-600">New Posts</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700">+{comprehensiveData.stats.newDealsLastMonth}</p>
                <p className="text-sm text-gray-600">Completed Deals</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700">+{comprehensiveData.stats.newEventsLastMonth}</p>
                <p className="text-sm text-gray-600">New Events</p>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          {comprehensiveData.topContributors && comprehensiveData.topContributors.length > 0 && (
            <div className="bg-white border border-red-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Contributors
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {comprehensiveData.topContributors.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-700">{user.ecoKarmaTotal}</p>
                      <p className="text-xs text-gray-500">EcoKarma</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Users */}
          <div className="bg-white border border-red-100 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {comprehensiveData.recentActivity.users.map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'organization' ? 'bg-indigo-100 text-indigo-700' :
                      u.role === 'business' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(u.createdAt).toLocaleDateString('en-US')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === 'users' ? (
        <div className="bg-white border border-red-100 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Name', 'Email', 'Role', 'EcoKarma', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-700">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select defaultValue={u.role} onChange={e => updateAdminUser(u.id, { role: e.target.value }).then(() => toast.success('Role updated'))}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none">
                      {['user', 'moderator', 'recycler', 'repair_provider', 'business', 'organization', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{u.ecoKarmaTotal || 0}</td>
                  <td className="px-4 py-3">
                    <select defaultValue={u.verificationStatus} onChange={e => updateAdminUser(u.id, { verificationStatus: e.target.value }).then(() => toast.success('Verification updated'))}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none mr-2">
                      <option value="unverified">Unverified</option>
                      <option value="community_verified">Community</option>
                      <option value="admin_verified">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'contributions' ? (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white border border-red-100 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users and organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Organizations Section */}
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Organizations ({organizationUsers.length})</h3>
            </div>
            {organizationUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No organizations found</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {organizationUsers.map(org => (
                  <div key={org.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{org.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Organization</span>
                        </div>
                        <p className="text-xs text-gray-500">{org.email}</p>
                      </div>
                      <button
                        onClick={() => handleViewContributions(org.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{org.ecoKarmaTotal || 0}</div>
                        <div className="text-xs text-gray-500">EcoKarma</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-purple-600">-</div>
                        <div className="text-xs text-gray-500">Challenges</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-blue-600">-</div>
                        <div className="text-xs text-gray-500">Events</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regular Users Section */}
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Users ({regularUsers.length})</h3>
            </div>
            {regularUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No users found</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {regularUsers.map(usr => (
                  <div key={usr.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{usr.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{usr.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{usr.role}</p>
                      </div>
                      <button
                        onClick={() => handleViewContributions(usr.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 flex-shrink-0">
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 justify-center p-2 bg-white rounded-lg">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <div className="text-lg font-bold text-gray-900">{usr.ecoKarmaTotal || 0}</div>
                      <div className="text-xs text-gray-500">EcoKarma</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Contributions Detail Modal */}
          {userContributions && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{userContributions.user.name}</h3>
                    <p className="text-sm text-gray-500">{userContributions.user.email}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${
                      userContributions.user.role === 'organization' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {userContributions.user.role}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setUserContributions(null); }}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{userContributions.user.ecoKarmaTotal}</div>
                    <div className="text-sm text-gray-600">Total EcoKarma</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{userContributions.user.verificationStatus}</div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">Contributions</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Posts', value: userContributions.contributions.posts },
                    { label: 'Devices', value: userContributions.contributions.devices },
                    { label: 'Listings', value: userContributions.contributions.listings },
                    { label: 'Waste Deposits', value: userContributions.contributions.wasteDeposits },
                    { label: 'Repair Requests', value: userContributions.contributions.repairRequests },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">Recent EcoKarma Activity</h4>
                <div className="space-y-2">
                  {userContributions.recentKarma.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{k.action}</p>
                        <p className="text-xs text-gray-500">{new Date(k.createdAt).toLocaleString('en-US')}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">+{k.points}</span>
                    </div>
                  ))}
                  {userContributions.recentKarma.length === 0 && (
                    <p className="text-center py-4 text-gray-400 text-sm">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : tab === 'locations' ? (
        <div className="space-y-3">
          {locations.length === 0 ? <p className="text-center py-8 text-gray-400">No pending locations</p> : locations.map(l => (
            <div key={l.id} className="bg-white border border-red-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{l.name}</p>
                <p className="text-sm text-gray-500">{l.category} · {l.city}</p>
                <p className="text-xs text-gray-400">{l.address}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleVerifyLocation(l.id, 'admin_verified')}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700">
                  Verify
                </button>
                <button onClick={() => handleVerifyLocation(l.id, 'unverified')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'providers' ? (
        <div className="space-y-3">
          {providers.length === 0 ? <p className="text-center py-8 text-gray-400">No pending providers</p> : providers.map(p => (
            <div key={p.id} className="bg-white border border-red-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{p.businessName}</p>
                <p className="text-sm text-gray-500">{p.type} · {p.city}</p>
                <p className="text-xs text-gray-400">{p.user?.name} ({p.user?.email})</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleVerifyProvider(p.id, 'admin_verified')}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700">
                  Verify
                </button>
                <button onClick={() => handleVerifyProvider(p.id, 'unverified')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'applications' ? (
        <ApplicationQueueTab />
      ) : tab === 'reports' ? (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-red-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    <span className="text-xs text-gray-400">{r.upvotes} upvotes</span>
                  </div>
                  <p className="font-semibold text-gray-900">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.city} · {r.reporter?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['under_review', 'verified', 'resolved', 'rejected'].map(s => (
                  <button key={s} onClick={() => handleUpdateReport(r.id, s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${r.status === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center py-8 text-gray-400">No pending reports</p>}
        </div>
      ) : tab === 'materials' ? (
        <div className="space-y-4">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              All Business Materials
            </h3>
            {materials.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No materials found</p>
            ) : (
              <div className="space-y-3">
                {materials.map(m => (
                  <div key={m.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{m.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Company: {m.companyName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        m.status === 'listed' ? 'bg-blue-100 text-blue-700' :
                        m.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                        m.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Type: {m.materialType}</span>
                      <span>Qty: {m.quantity} {m.unit}</span>
                      {m.pricePerUnit && <span>Price: ${m.pricePerUnit}/{m.unit}</span>}
                      <span>Requests: {m.requests?.length || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">By: {m.user?.name} ({m.user?.email})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : tab === 'challenges' ? (
        <div className="space-y-4">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              All Challenges
            </h3>
            {challenges.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No challenges found</p>
            ) : (
              <div className="space-y-3">
                {challenges.map(c => (
                  <div key={c.id} className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{c.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        c.status === 'active' ? 'bg-green-100 text-green-700' :
                        c.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span>Goal: {c.goalType} - {c.goalValue}</span>
                      <span>Progress: {c.currentValue || 0}</span>
                      <span>Participants: {c.participants?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">By: {c.creator?.name}</span>
                      <span className="text-gray-400">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : tab === 'events' ? (
        <div className="space-y-4">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              All Events
            </h3>
            {events.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No events found</p>
            ) : (
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{e.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{e.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        e.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        e.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                        e.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span>Type: {e.eventType}</span>
                      <span>Participants: {e.participants?.length || 0} / {e.maxParticipants || '∞'}</span>
                      {e.location && <span>Location: {e.location}</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">By: {e.creator?.name}</span>
                      <span className="text-gray-400">{new Date(e.startDate).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : tab === 'repairs' ? (
        <div className="space-y-4">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              All Repair Requests
            </h3>
            {repairs.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No repair requests found</p>
            ) : (
              <div className="space-y-3">
                {repairs.map(r => (
                  <div key={r.id} className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{r.itemName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                        {r.diagnosis && <p className="text-xs text-gray-500 mt-1">Diagnosis: {r.diagnosis}</p>}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        r.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                        r.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        r.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                        r.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span>Customer: {r.user?.name}</span>
                      {r.provider && <span>Provider: {r.provider.businessName}</span>}
                      {r.estimatedCost && <span>Est. Cost: ${r.estimatedCost}</span>}
                    </div>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : tab === 'deposits' ? (
        <div className="space-y-4">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-teal-600" />
              All Waste Deposits
            </h3>
            {deposits.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No waste deposits found</p>
            ) : (
              <div className="space-y-3">
                {deposits.map(d => (
                  <div key={d.id} className="p-4 bg-teal-50 border border-teal-100 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{d.deviceType}</h4>
                        <p className="text-sm text-gray-600 mt-1">Condition: {d.condition}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        d.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                        d.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {d.verificationStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span>Weight: {d.weight} kg</span>
                      <span>Quantity: {d.quantity}</span>
                      <span>EcoKarma: +{d.ecoKarmaEarned || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">User: {d.user?.name}</span>
                      {d.provider && <span className="text-gray-500">Provider: {d.provider.businessName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : tab === 'analytics' ? (
        <div className="space-y-6">
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Platform Analytics - Growth Trends
            </h3>
            {analytics ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">Showing data for: <span className="font-semibold">{analytics.period}</span></p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> User Growth
                    </h4>
                    <div className="space-y-2">
                      {analytics.growth.users.slice(-7).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                          <span className="font-semibold text-blue-700">+{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post Growth */}
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Post Growth
                    </h4>
                    <div className="space-y-2">
                      {analytics.growth.posts.slice(-7).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                          <span className="font-semibold text-purple-700">+{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Material Growth */}
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Material Growth
                    </h4>
                    <div className="space-y-2">
                      {analytics.growth.materials.slice(-7).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                          <span className="font-semibold text-emerald-700">+{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event Growth */}
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Event Growth
                    </h4>
                    <div className="space-y-2">
                      {analytics.growth.events.slice(-7).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                          <span className="font-semibold text-indigo-700">+{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">Loading analytics...</p>
            )}
          </div>
        </div>
      ) : tab === 'applications' ? (
        <ApplicationQueueTab />
      ) : null}
    </div>
  );
}
