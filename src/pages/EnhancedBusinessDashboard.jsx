import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Building2, Package, TrendingUp, Plus, Loader2, CheckCircle, Clock,
  DollarSign, Inbox, BarChart3, ArrowRight, Users, FileText, X, Check,
  XCircle, Edit, Trash2, Search, Filter, RefreshCw, ArrowUpRight, Target,
  Calendar, MapPin, Phone, Mail, AlertCircle, TrendingDown, Activity
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import * as businessService from '../services/businessService';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  listed: 'bg-blue-100 text-blue-700 border-blue-200',
  requested: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
};

const TYPE_EMOJI = {
  cardboard: '📦', plastic: '♻️', wood: '🪵', textile: '🧵',
  packaging: '🎁', construction: '🏗️', electronics: '⚡',
  industrial: '🏭', metal: '⚙️', other: '📋',
};

const MATERIAL_TYPES = [
  'cardboard', 'plastic', 'wood', 'textile', 'packaging',
  'construction', 'electronics', 'industrial', 'metal', 'other'
];

export default function EnhancedBusinessDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [myMaterials, setMyMaterials] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [period, setPeriod] = useState('30d');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await businessService.getBusinessDashboard();
      setDashboardData(res.data.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await businessService.getBusinessAnalytics({ period });
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const loadMyMaterials = async () => {
    setLoading(true);
    try {
      const res = await businessService.getMyMaterials();
      setMyMaterials(res.data.data || []);
    } catch (error) {
      console.log('Materials data not available yet');
      setMyMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const res = await businessService.getMyRequests();
      setMyRequests(res.data.data || []);
    } catch (error) {
      console.log('Requests data not available yet');
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.materialType = filterType;
      const res = await businessService.getMaterials(params);
      setAllMaterials(res.data.data.items || []);
    } catch (error) {
      console.log('Marketplace data not available yet');
      setAllMaterials([]);
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
      loadAnalytics();
    } else if (activeTab === 'my_listings') {
      loadMyMaterials();
    } else if (activeTab === 'my_requests') {
      loadMyRequests();
    } else if (activeTab === 'marketplace') {
      loadMarketplace();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, period]);

  if (!['business', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await businessService.deleteMaterial(id);
      toast.success('Material deleted');
      loadMyMaterials();
      loadDashboard();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleRequestMaterial = async (materialId) => {
    try {
      await businessService.requestMaterial(materialId, {
        message: 'Interested in this material',
        quantity: 1
      });
      toast.success('Request sent successfully');
      loadMarketplace();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to send request');
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await businessService.updateRequestStatus(requestId, { status });
      toast.success(`Request ${status}`);
      loadDashboard();
      loadMyMaterials();
    } catch (error) {
      toast.error('Failed to update status');
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Exchange Hub</h1>
                <p className="text-sm text-gray-500">B2B Material Trading Platform</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { loadDashboard(); loadMyMaterials(); loadMarketplace(); }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link to="/business"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">List Material</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'my_listings', label: 'My Listings', icon: Package },
              { id: 'my_requests', label: 'My Requests', icon: Inbox },
              { id: 'marketplace', label: 'Marketplace', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: Activity },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
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
            onAcceptRequest={handleUpdateRequestStatus}
            onRejectRequest={handleUpdateRequestStatus}
            onViewMaterial={(m) => { setSelectedItem(m); setShowModal(true); }}
          />
        )}

        {/* My Listings Tab */}
        {activeTab === 'my_listings' && (
          <MyListingsTab 
            materials={myMaterials}
            loading={loading}
            onDelete={handleDeleteMaterial}
            onView={(m) => { setSelectedItem(m); setShowModal(true); }}
          />
        )}

        {/* My Requests Tab */}
        {activeTab === 'my_requests' && (
          <MyRequestsTab 
            requests={myRequests}
            loading={loading}
          />
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <MarketplaceTab 
            materials={allMaterials}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            onSearch={loadMarketplace}
            onRequest={handleRequestMaterial}
            onView={(m) => { setSelectedItem(m); setShowModal(true); }}
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

        {/* Material Details Modal */}
        {showModal && selectedItem && (
          <MaterialModal 
            item={selectedItem}
            onClose={() => { setShowModal(false); setSelectedItem(null); }}
            onRequest={handleRequestMaterial}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats, dashboardData, onAcceptRequest, onRejectRequest, onViewMaterial }) {
  const recentListings = dashboardData?.recentListings || [];
  const pendingIncoming = dashboardData?.pendingIncoming || [];
  const pendingOutgoing = dashboardData?.pendingOutgoing || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Active Listings" value={stats.activeListings || 0} color="blue" trend="+12%" />
        <StatCard icon={Inbox} label="Incoming Requests" value={stats.incomingRequests || 0} color="yellow" trend="+5" />
        <StatCard icon={ArrowUpRight} label="Outgoing Requests" value={stats.outgoingRequests || 0} color="purple" />
        <StatCard icon={CheckCircle} label="Completed Deals" value={stats.completedDeals || 0} color="green" trend="+8" />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Listed Value</p>
              <p className="text-3xl font-bold text-gray-900">
                Rp {(stats.totalListedValue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>Active inventory value</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                Rp {(stats.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span>From completed deals</span>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingIncoming.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-yellow-500" />
            Incoming Requests ({pendingIncoming.length})
          </h3>
          <div className="space-y-3">
            {pendingIncoming.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{req.material.title}</p>
                  <p className="text-sm text-gray-500">
                    {req.requester.name} wants {req.quantity} {req.material.unit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{req.message}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => onAcceptRequest(req.id, 'accepted')}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => onRejectRequest(req.id, 'cancelled')}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Recent Listings
            </h3>
            <Link to="/business-dashboard?tab=my_listings" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {recentListings.slice(0, 3).map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onViewMaterial(m)}>
                <span className="text-2xl flex-shrink-0">{TYPE_EMOJI[m.materialType] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.title}</p>
                  <p className="text-sm text-gray-500">{parseFloat(m.quantity).toLocaleString()} {m.unit} · {m.city}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLE[m.status]}`}>
                    {m.status}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {m.isFree ? 'FREE' : `Rp ${Number(m.price).toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
        <Building2 className="w-8 h-8 text-indigo-200 mb-3" />
        <h3 className="font-bold text-xl mb-2">B2B Material Exchange</h3>
        <p className="text-indigo-100 mb-4">
          List your surplus materials and connect directly with other businesses. Zero commission, direct circular economy. 
          Turn waste into value and build sustainable partnerships.
        </p>
        <div className="flex gap-3">
          <Link to="/business"
            className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2">
            List Material <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/business"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition-colors">
            Browse Exchange
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, trend }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
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

// My Listings Tab
function MyListingsTab({ materials, loading, onDelete, onView }) {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg mb-2">No listings yet</p>
        <p className="text-gray-400 text-sm mb-4">Start by listing your surplus materials</p>
        <Link to="/business"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          <Plus className="w-4 h-4" /> Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {materials.map(m => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">{TYPE_EMOJI[m.materialType] || '📋'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{m.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_STYLE[m.status]}`}>
                  {m.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {parseFloat(m.quantity).toLocaleString()} {m.unit}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {m.city}
                </span>
                <span className="flex items-center gap-1">
                  <Inbox className="w-4 h-4" />
                  {m.requestCount || 0} requests
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <DollarSign className="w-4 h-4" />
                  {m.isFree ? 'FREE' : `Rp ${Number(m.price).toLocaleString()}/${m.unit}`}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button onClick={() => onView(m)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  View Details
                </button>
                <Link to={`/business?edit=${m.id}`}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Link>
                <button onClick={() => onDelete(m.id)}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// My Requests Tab
function MyRequestsTab({ requests, loading }) {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg mb-2">No requests sent yet</p>
        <p className="text-gray-400 text-sm mb-4">Browse marketplace to find materials</p>
        <Link to="/business"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {requests.map(req => (
        <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">{TYPE_EMOJI[req.material.materialType] || '📋'}</span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{req.material.title}</h3>
                  <p className="text-sm text-gray-500">From: {req.material.user.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[req.status]}`}>
                  {req.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                <span>{req.quantity} {req.material.unit} requested</span>
                <span>•</span>
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>

              {req.message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{req.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Marketplace Tab
function MarketplaceTab({ materials, loading, searchTerm, setSearchTerm, filterType, setFilterType, onSearch, onRequest, onView }) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Types</option>
            {MATERIAL_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <button onClick={onSearch}
          className="mt-3 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : materials.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No materials found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{TYPE_EMOJI[m.materialType] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{m.title}</h3>
                      <p className="text-sm text-gray-500">{m.companyName}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        {m.isFree ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `Rp ${Number(m.price).toLocaleString()}`
                        )}
                      </p>
                      <p className="text-xs text-gray-500">per {m.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {parseFloat(m.quantity).toLocaleString()} {m.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {m.city}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{m.materialType}</span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button onClick={() => onView(m)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button onClick={() => onRequest(m.id)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-4 h-4" /> Request
                    </button>
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

// Analytics Tab
function AnalyticsTab({ analytics, period, setPeriod, stats }) {
  if (!analytics) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Analytics Period</h3>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Materials by Type */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Materials by Type
        </h3>
        <div className="space-y-3">
          {(analytics.materialsByType || []).map(item => (
            <div key={item.materialType} className="flex items-center gap-3">
              <span className="text-2xl">{TYPE_EMOJI[item.materialType]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.materialType}</span>
                  <span className="text-sm text-gray-500">{item.count} listings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(item.count / Math.max(...analytics.materialsByType.map(i => i.count))) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Active Listings</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeListings || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Completed Deals</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completedDeals || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            Rp {((stats.totalRevenue || 0) / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Avg. Deal Value</p>
          <p className="text-2xl font-bold text-gray-900">
            Rp {stats.completedDeals > 0 ? ((stats.totalRevenue / stats.completedDeals) / 1000).toFixed(0) : 0}K
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Analytics Insights</h4>
            <p className="text-sm text-gray-600">
              Track your business performance over time. Monitor material types, deal completion rates, 
              and revenue trends to optimize your circular economy strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Material Details Modal
function MaterialModal({ item, onClose, onRequest }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Material Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl">{TYPE_EMOJI[item.materialType] || '📋'}</span>
              <div className="flex-1">
                <h4 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-lg text-gray-600">{item.companyName}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_STYLE[item.status]}`}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
            <p className="text-gray-700 leading-relaxed">{item.description || 'No description provided'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="font-semibold text-gray-900">{parseFloat(item.quantity).toLocaleString()} {item.unit}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="font-semibold text-gray-900">
                {item.isFree ? 'FREE' : `Rp ${Number(item.price).toLocaleString()}/${item.unit}`}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-semibold text-gray-900">{item.city}, {item.province}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-semibold text-gray-900 capitalize">{item.materialType}</p>
            </div>
          </div>

          {/* Contact Info */}
          {(item.contactEmail || item.contactPhone) && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-3">Contact Information</p>
              <div className="space-y-2">
                {item.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <a href={`mailto:${item.contactEmail}`} className="text-indigo-700 hover:underline">
                      {item.contactEmail}
                    </a>
                  </div>
                )}
                {item.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <a href={`tel:${item.contactPhone}`} className="text-indigo-700 hover:underline">
                      {item.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {item.status === 'listed' && (
              <button onClick={() => { onRequest(item.id); onClose(); }}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Request Material
              </button>
            )}
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
