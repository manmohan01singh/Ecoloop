import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Recycle, Package, Truck, CheckCircle, Clock, TrendingUp,
  Users, Building2, Calendar, MapPin, Weight, Loader2,
  Plus, Search, Filter, FileText, Award, BarChart3, MessageSquare
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import {
  getRecyclerDashboard,
  getRecyclingRequests,
  handleRecyclingRequest,
  getPickups,
  updatePickupStatus,
  getCollectedWaste,
  recordCollection,
  getCollectionDrives,
  getOrganizations,
  getRecyclerImpact
} from '../services/recyclerService';
import toast from 'react-hot-toast';

export default function RecyclerDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [collections, setCollections] = useState([]);
  const [drives, setDrives] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [impact, setImpact] = useState({});
  const [provider, setProvider] = useState(null);

  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({ material: '', weightKg: '', pricePerKg: '', userId: '' });

  // Check permissions
  if (!['recycler', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (tab !== 'dashboard') {
      loadTabData();
    }
  }, [tab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getRecyclerDashboard();
      setStats(response.data.data.stats);
      setProvider(response.data.data.provider);
    } catch (error) {
      // Silently handle error - set empty stats
      console.log('Dashboard data not available yet');
      setStats({});
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (tab === 'requests') {
        const response = await getRecyclingRequests({});
        setRequests(response.data.data.items);
      } else if (tab === 'pickups') {
        const response = await getPickups({});
        setPickups(response.data.data);
      } else if (tab === 'collections') {
        const response = await getCollectedWaste({});
        setCollections(response.data.data.items);
      } else if (tab === 'drives') {
        const response = await getCollectionDrives();
        setDrives(response.data.data);
      } else if (tab === 'organizations') {
        const response = await getOrganizations();
        setOrganizations(response.data.data);
      } else if (tab === 'impact') {
        const response = await getRecyclerImpact();
        setImpact(response.data.data);
      }
    } catch (error) {
      // Silently handle error - set empty data
      console.log(`${tab} data not available yet`);
      if (tab === 'requests') setRequests([]);
      else if (tab === 'pickups') setPickups([]);
      else if (tab === 'collections') setCollections([]);
      else if (tab === 'drives') setDrives([]);
      else if (tab === 'organizations') setOrganizations([]);
      else if (tab === 'impact') setImpact({});
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (id, action) => {
    try {
      if (action === 'accept') {
        const cost = prompt('Enter estimated cost (optional):');
        const date = prompt('Enter scheduled date (YYYY-MM-DD, optional):');
        await handleRecyclingRequest(id, { action, estimatedCost: cost, scheduledDate: date });
      } else {
        await handleRecyclingRequest(id, { action });
      }
      toast.success(`Request ${action}ed successfully`);
      loadTabData();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handlePickupStatusUpdate = async (id, status) => {
    try {
      await updatePickupStatus(id, { status });
      toast.success('Pickup status updated');
      loadTabData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRecordCollection = async (e) => {
    e.preventDefault();
    try {
      await recordCollection(recordForm);
      toast.success('Collection recorded successfully');
      setShowRecordModal(false);
      setRecordForm({ material: '', weightKg: '', pricePerKg: '', userId: '' });
      loadTabData();
    } catch (error) {
      toast.error('Failed to record collection');
    }
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Recycle },
    { id: 'requests', label: `Requests ${stats.pendingRequests ? `(${stats.pendingRequests})` : ''}`, icon: FileText },
    { id: 'pickups', label: 'Pickups', icon: Truck },
    { id: 'collections', label: 'Collections', icon: Package },
    { id: 'drives', label: 'Drives', icon: Calendar },
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Recycle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recycler Dashboard</h1>
            <p className="text-gray-500 text-sm">{provider?.businessName || user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <Recycle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Recycler</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          {tab === 'dashboard' && <DashboardTab stats={stats} />}
          {tab === 'requests' && <RequestsTab requests={requests} onAction={handleRequestAction} />}
          {tab === 'pickups' && <PickupsTab pickups={pickups} onStatusUpdate={handlePickupStatusUpdate} />}
          {tab === 'collections' && (
            <CollectionsTab
              collections={collections}
              onRecord={() => setShowRecordModal(true)}
            />
          )}
          {tab === 'drives' && <DrivesTab drives={drives} />}
          {tab === 'organizations' && <OrganizationsTab organizations={organizations} />}
          {tab === 'impact' && <ImpactTab impact={impact} />}
          {tab === 'profile' && <ProfileTab provider={provider} />}
        </>
      )}

      {/* Record Collection Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Collection</h3>
            <form onSubmit={handleRecordCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                <input
                  type="text"
                  required
                  value={recordForm.material}
                  onChange={(e) => setRecordForm({ ...recordForm, material: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Smartphone, Laptop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={recordForm.weightKg}
                  onChange={(e) => setRecordForm({ ...recordForm, weightKg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per kg (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={recordForm.pricePerKg}
                  onChange={(e) => setRecordForm({ ...recordForm, pricePerKg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ stats }) {
  const statCards = [
    { icon: Package, label: 'Total E-Waste Collected', value: stats.totalCollected || 0, color: 'green', unit: 'items' },
    { icon: Clock, label: 'Pending Requests', value: stats.pendingRequests || 0, color: 'yellow', unit: '' },
    { icon: Truck, label: 'Upcoming Pickups', value: stats.upcomingPickups || 0, color: 'blue', unit: '' },
    { icon: CheckCircle, label: 'Completed Recycling', value: stats.completedRecycling || 0, color: 'emerald', unit: '' },
    { icon: Weight, label: 'Total Weight', value: stats.totalWeightKg || 0, color: 'purple', unit: 'kg' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
                {stat.unit && <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all text-left">
            <FileText className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-sm">View Requests</p>
            <p className="text-xs text-gray-500">Check new recycling requests</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all text-left">
            <Truck className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-sm">Manage Pickups</p>
            <p className="text-xs text-gray-500">Schedule and track pickups</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all text-left">
            <Package className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-sm">Record Collection</p>
            <p className="text-xs text-gray-500">Add new waste collection</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Requests Tab
function RequestsTab({ requests, onAction }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recycling Requests</h2>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="requested">Requested</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{req.itemName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {req.user?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {req.city}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>

              {req.status === 'requested' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAction(req.id, 'accept')}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onAction(req.id, 'reject')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Pickups Tab
function PickupsTab({ pickups, onStatusUpdate }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pickup Management</h2>

      {pickups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pickups scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pickups.map((pickup) => (
            <div key={pickup.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{pickup.itemName}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {pickup.user?.address}, {pickup.user?.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {pickup.user?.name} - {pickup.user?.phone}
                    </p>
                    {pickup.scheduledDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(pickup.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pickup.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                  pickup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {pickup.status.replace('_', ' ')}
                </span>
              </div>

              {pickup.status !== 'completed' && (
                <div className="flex gap-2">
                  {pickup.status === 'accepted' && (
                    <button
                      onClick={() => onStatusUpdate(pickup.id, 'in_progress')}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700"
                    >
                      Start Pickup
                    </button>
                  )}
                  {pickup.status === 'in_progress' && (
                    <button
                      onClick={() => onStatusUpdate(pickup.id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Collections Tab
function CollectionsTab({ collections, onRecord }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Collected E-Waste</h2>
        <button
          onClick={onRecord}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Record Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No collections recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <div key={col.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{col.material}</h3>
                  <p className="text-sm text-gray-500">From: {col.user?.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      {col.weightKg} kg
                    </span>
                    <span>₹{col.totalValue}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(col.depositDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Drives Tab
function DrivesTab({ drives }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Collection Drives</h2>

      {drives.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active drives</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {drives.map((drive) => (
            <div key={drive.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{drive.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drive.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {drive.currentValue}/{drive.goalValue} {drive.goalType}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  drive.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {drive.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Organizations Tab
function OrganizationsTab({ organizations }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Organizations & Businesses</h2>

      {organizations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No organizations found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                  <p className="text-xs text-gray-500">{org.city}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{org.ecoKarmaTotal} karma</span>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  org.role === 'organization' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {org.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Impact Tab
function ImpactTab({ impact }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Impact & Analytics</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Weight className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{impact.totalWeightKg || 0} kg</p>
          <p className="text-sm text-gray-500">Total Recycled</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Package className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{impact.totalDeposits || 0}</p>
          <p className="text-sm text-gray-500">Total Deposits</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Users className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{impact.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">Users Served</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <TrendingUp className="w-8 h-8 text-emerald-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{impact.co2SavedKg || 0} kg</p>
          <p className="text-sm text-gray-500">CO₂ Saved</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Material Breakdown</h3>
        {impact.materialBreakdown && impact.materialBreakdown.length > 0 ? (
          <div className="space-y-3">
            {impact.materialBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.material}</span>
                <span className="text-sm font-medium text-gray-900">{parseFloat(item.totalWeight).toFixed(2)} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-4">No data available</p>
        )}
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ provider }) {
  if (!provider) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Provider profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Profile & Verification</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{provider.businessName}</h3>
            <p className="text-gray-500">{provider.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            provider.verificationStatus === 'admin_verified' ? 'bg-green-100 text-green-700' :
            provider.verificationStatus === 'community_verified' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {provider.verificationStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-600 mt-1">{provider.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-600 mt-1">{provider.address}</p>
              <p className="text-gray-600">{provider.city}, {provider.province}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact</label>
              <p className="text-gray-600 mt-1">Phone: {provider.phone}</p>
              <p className="text-gray-600">WhatsApp: {provider.whatsapp}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Service Radius</label>
            <p className="text-gray-600 mt-1">{provider.serviceRadius} km</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Accepted Materials</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {provider.acceptedMaterials?.map((material, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {material}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{provider.completedJobs}</p>
              <p className="text-sm text-gray-500">Completed Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {provider.ratingCount > 0 ? (provider.ratingSum / provider.ratingCount).toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{provider.ratingCount}</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
