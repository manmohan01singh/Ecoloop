import { useState, useEffect } from 'react';
import { Users, FileText, Package, AlertTriangle, CheckCircle, Loader2, Shield, MapPin, Wrench, Building2, TrendingUp, Award, Search, Eye } from 'lucide-react';
import { getAdminDashboard, getAdminUsers, updateAdminUser, getPendingLocations, verifyLocationAdmin, getPendingProviders, verifyProvider, getPendingReports, updateReportStatus, getUserContributions } from '../services/communityService';
import useAuthStore from '../context/authStore';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';

const STATUS_STYLE = { reported: 'bg-yellow-100 text-yellow-700', under_review: 'bg-blue-100 text-blue-700', verified: 'bg-purple-100 text-purple-700', resolved: 'bg-green-100 text-green-700', rejected: 'bg-gray-100 text-gray-600' };

export default function EnhancedAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContributions, setUserContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 'overview') {
          const r = await getAdminDashboard();
          setData(r.data.data);
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
        }
      } catch (err) {
        toast.error('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

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
    ['locations', 'Locations'],
    ['providers', 'Providers'],
    ['reports', 'Reports']
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
          <p className="text-gray-500 text-sm">Manage EcoLoop Platform</p>
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
      ) : tab === 'overview' && data ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Users, label: 'Total Users', value: data.stats.users, color: 'blue' },
              { icon: FileText, label: 'Total Posts', value: data.stats.posts, color: 'purple' },
              { icon: Package, label: 'Total Listings', value: data.stats.listings, color: 'emerald' },
              { icon: AlertTriangle, label: 'Pending Reports', value: data.stats.pendingReports, color: 'red' },
              { icon: Wrench, label: 'Pending Providers', value: data.stats.pendingProviders, color: 'orange' },
              { icon: MapPin, label: 'Pending Locations', value: data.stats.pendingLocations, color: 'teal' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-red-100 rounded-xl p-5">
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-red-100 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {data.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'organization' ? 'bg-indigo-100 text-indigo-700' :
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
      ) : null}
    </div>
  );
}
