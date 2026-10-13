import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Wrench, Clock, CheckCircle, AlertCircle, Calendar, Users, 
  DollarSign, Star, Settings, Package, Recycle,
  MapPin, Phone, Mail, Loader2, Search, Eye, X, Check, XCircle, 
  TrendingUp, Award, RefreshCw, FileText, Camera, Save, Edit,
  Plus, Trash2, Image as ImageIcon, Hammer
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import * as repairService from '../services/repairProviderService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  requested: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORIES = ['Mobile', 'Laptop', 'TV', 'Gaming Console', 'Appliances', 'Computer', 'Tablet', 'Monitor', 'Printer', 'Other'];

export default function EnhancedRepairDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState({ specializations: [], acceptedMaterials: [] });
  const [reviews, setReviews] = useState([]);
  const [provider, setProvider] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Load dashboard overview
  const loadDashboard = async () => {
    try {
      const res = await repairService.getDashboard();
      setDashboardData(res.data.data);
      setProvider(res.data.data.provider);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  // Load requests with filters
  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      
      const res = await repairService.getRepairRequests(params);
      setRequests(res.data.data.items || []);
    } catch (error) {
      console.error('Load requests error:', error);
      // Silently handle error - no toast
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await repairService.getCustomers();
      setCustomers(res.data.data || []);
    } catch (error) {
      console.error('Load customers error:', error);
    }
  };

  // Load services
  const loadServices = async () => {
    try {
      const res = await repairService.getServices();
      setServices(res.data.data);
    } catch (error) {
      console.error('Load services error:', error);
    }
  };

  // Load reviews
  const loadReviews = async () => {
    try {
      const res = await repairService.getReviews();
      setReviews(res.data.data.reviews || []);
    } catch (error) {
      console.error('Load reviews error:', error);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') loadRequests();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'services') loadServices();
    if (activeTab === 'reviews') loadReviews();
  }, [activeTab, statusFilter, categoryFilter]);

  if (!['repair_provider', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Accept request
  const handleAcceptRequest = async (id) => {
    try {
      await repairService.acceptRepairRequest(id);
      toast.success('Request accepted successfully');
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to accept request');
    }
  };

  // Reject request
  const handleRejectRequest = async (id, reason) => {
    try {
      await repairService.rejectRepairRequest(id, { reason });
      toast.success('Request rejected');
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  // Update status
  const handleUpdateStatus = async (id, status) => {
    try {
      await repairService.updateRepairStatus(id, { status });
      toast.success('Status updated successfully');
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Add diagnosis
  const handleAddDiagnosis = async (id, data) => {
    try {
      await repairService.addDiagnosis(id, data);
      toast.success('Diagnosis added successfully');
      loadRequests();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to add diagnosis');
    }
  };

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Repair Provider Hub</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <button onClick={() => { loadDashboard(); loadRequests(); }}
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
              { id: 'requests', label: 'Requests', icon: Wrench },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'services', label: 'Services', icon: Hammer },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'profile', label: 'Profile', icon: Settings },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-md' 
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
          <DashboardTab stats={stats} recentActivity={recentActivity} customers={customers} onViewRequest={(r) => { setSelectedRequest(r); setShowModal(true); }} />
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <RequestsTab 
            requests={requests} 
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onSearch={loadRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={(r) => { setSelectedRequest(r); setShowModal(true); }}
          />
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <CustomersTab customers={customers} />
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <ServicesTab services={services} onUpdate={(data) => {
            repairService.updateServices(data).then(() => {
              toast.success('Services updated successfully');
              loadServices();
            }).catch(() => toast.error('Failed to update services'));
          }} />
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <ReviewsTab reviews={reviews} rating={stats.rating} totalReviews={stats.totalReviews} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab provider={provider} onUpdate={(data) => {
            repairService.updateProfile(data).then(() => {
              toast.success('Profile updated successfully');
              loadDashboard();
            }).catch(() => toast.error('Failed to update profile'));
          }} />
        )}

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <RequestDetailsModal 
            request={selectedRequest} 
            onClose={() => { setShowModal(false); setSelectedRequest(null); }}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onUpdateStatus={handleUpdateStatus}
            onAddDiagnosis={handleAddDiagnosis}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats, recentActivity, customers, onViewRequest }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertCircle} label="New Requests" value={stats.newRequests || 0} color="yellow" />
        <StatCard icon={Clock} label="Active Repairs" value={stats.activeRepairs || 0} color="purple" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completedRepairs || 0} color="green" />
        <StatCard icon={Calendar} label="Today's Jobs" value={stats.todaysAppointments || 0} color="blue" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue || '0.00'}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.rating || '0.0'}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.totalReviews || 0} reviews</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{customers.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map(req => (
              <div key={req.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onViewRequest(req)}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{req.itemName}</p>
                  <p className="text-sm text-gray-500">{req.user?.name} · {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white shadow-lg">
        <Wrench className="w-8 h-8 text-orange-100 mb-3" />
        <h3 className="font-bold text-xl mb-2">Repair Hub</h3>
        <p className="text-orange-100">Accept and manage repair requests from the community. Each completed repair earns EcoKarma and extends device lifespan, contributing to the circular economy.</p>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Requests Tab Component
function RequestsTab({ requests, loading, searchTerm, setSearchTerm, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, onSearch, onAccept, onReject, onUpdateStatus, onViewDetails }) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="all">All Status</option>
            <option value="new">New Requests</option>
            <option value="mine">My Requests</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No repair requests found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <RequestCard key={req.id} request={req} onAccept={onAccept} onReject={onReject} onUpdateStatus={onUpdateStatus} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}
    </div>
  );
}

// Request Card Component
function RequestCard({ request, onAccept, onReject, onUpdateStatus, onViewDetails }) {
  const isNew = !request.providerId && request.status === 'requested';
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{request.itemName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[request.status]}`}>
              {request.status.replace('_', ' ')}
            </span>
            {isNew && <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">NEW</span>}
          </div>
          
          {request.category && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mb-2">{request.category}</span>
          )}
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
          
          {request.user && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {request.user.name}
              </span>
              {request.user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {request.user.city}
                </span>
              )}
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {request.diagnosis && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-1">Diagnosis</p>
              <p className="text-sm text-blue-700 mb-1">{request.diagnosis}</p>
              {request.estimatedCost && (
                <p className="text-sm font-bold text-blue-900">Est. Cost: ${request.estimatedCost}</p>
              )}
            </div>
          )}
        </div>

        {request.images && request.images.length > 0 && (
          <div className="flex-shrink-0">
            <img src={request.images[0]} alt="Device" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button onClick={() => onViewDetails(request)} 
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        
        {isNew && (
          <>
            <button onClick={() => onAccept(request.id)} 
              className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button onClick={() => onReject(request.id, 'Not available')} 
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {request.status === 'accepted' && (
          <button onClick={() => onUpdateStatus(request.id, 'in_progress')} 
            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Start Repair
          </button>
        )}

        {request.status === 'in_progress' && (
          <button onClick={() => onUpdateStatus(request.id, 'completed')} 
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}

// Customers Tab Component
function CustomersTab({ customers }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Your Customers</h2>
      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No customers yet</p>
          <p className="text-gray-400 text-sm mt-2">Start accepting repair requests to build your customer base</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {customer.totalRepairs} total repairs · {customer.completedRepairs} completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last repair</p>
                <p className="text-xs text-gray-400">{new Date(customer.lastRepairDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Services Tab Component
function ServicesTab({ services, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [specializations, setSpecializations] = useState(services.specializations || []);
  const [materials, setMaterials] = useState(services.acceptedMaterials || []);
  const [newSpec, setNewSpec] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  useEffect(() => {
    setSpecializations(services.specializations || []);
    setMaterials(services.acceptedMaterials || []);
  }, [services]);

  const handleSave = () => {
    onUpdate({ specializations, acceptedMaterials: materials });
    setEditing(false);
  };

  const addSpecialization = () => {
    if (newSpec.trim()) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials([...materials, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Services</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={() => setEditing(false)} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Specializations */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-gray-400" />
            Repair Specializations
          </h3>
          {editing && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="Add specialization (e.g., Screen Replacement)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
              />
              <button onClick={addSpecialization} 
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec, idx) => (
              <span key={idx} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-orange-200">
                {spec}
                {editing && (
                  <button onClick={() => setSpecializations(specializations.filter((_, i) => i !== idx))} 
                    className="hover:text-orange-900">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </span>
            ))}
            {specializations.length === 0 && <p className="text-gray-400 text-sm py-2">No specializations added yet</p>}
          </div>
        </div>

        {/* Accepted Device Types */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            Accepted Device Types
          </h3>
          {editing && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Add device type (e.g., iPhone, Samsung Galaxy)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
              />
              <button onClick={addMaterial} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {materials.map((mat, idx) => (
              <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-200">
                {mat}
                {editing && (
                  <button onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} 
                    className="hover:text-blue-900">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </span>
            ))}
            {materials.length === 0 && <p className="text-gray-400 text-sm py-2">No device types added yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews, rating, totalReviews }) {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900">{rating || '0.0'}</p>
            <div className="flex items-center gap-1 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{totalReviews || 0} reviews</p>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="text-right">
            <p className="text-sm text-gray-500">Keep up the great work!</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">Complete repairs to receive customer feedback</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-700 mt-2">{review.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ provider, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: provider?.businessName || '',
    description: provider?.description || '',
    address: provider?.address || '',
    city: provider?.city || '',
    province: provider?.province || '',
    phone: provider?.phone || '',
    whatsapp: provider?.whatsapp || '',
    email: provider?.email || '',
    website: provider?.website || '',
    serviceRadius: provider?.serviceRadius || 10,
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        businessName: provider.businessName || '',
        description: provider.description || '',
        address: provider.address || '',
        city: provider.city || '',
        province: provider.province || '',
        phone: provider.phone || '',
        whatsapp: provider.whatsapp || '',
        email: provider.email || '',
        website: provider.website || '',
        serviceRadius: provider.serviceRadius || 10,
      });
    }
  }, [provider]);

  const handleSave = () => {
    onUpdate(formData);
    setEditing(false);
  };

  if (!provider) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Provider Profile</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={() => setEditing(false)} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries({
          businessName: 'Business Name',
          city: 'City',
          province: 'Province',
          phone: 'Phone',
          whatsapp: 'WhatsApp',
          email: 'Email',
          website: 'Website',
          serviceRadius: 'Service Radius (km)',
        }).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
              type={key === 'serviceRadius' ? 'number' : 'text'}
              value={formData[key]}
              onChange={(e) => setFormData({ ...formData, [key]: key === 'serviceRadius' ? parseInt(e.target.value) : e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={!editing}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={!editing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-600"
        />
      </div>

      {/* Stats */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Business Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{provider.completedJobs || 0}</p>
            <p className="text-sm text-gray-500">Completed Jobs</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{provider.ratingCount || 0}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{provider.serviceRadius || 0} km</p>
            <p className="text-sm text-gray-500">Service Radius</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 capitalize">{provider.verificationStatus}</p>
            <p className="text-sm text-gray-500">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Request Details Modal Component
function RequestDetailsModal({ request, onClose, onAccept, onReject, onUpdateStatus, onAddDiagnosis }) {
  const [diagnosisData, setDiagnosisData] = useState({
    diagnosis: '',
    estimatedCost: '',
    estimatedTime: '',
  });

  const isNew = !request.providerId && request.status === 'requested';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Request Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Info */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Device</p>
            <p className="text-2xl font-semibold text-gray-900 mb-2">{request.itemName}</p>
            {request.category && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {request.category}
              </span>
            )}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[request.status]}`}>
              {request.status.replace('_', ' ')}
            </span>
          </div>

          {/* Problem Description */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Problem Description</p>
            <p className="text-gray-900 leading-relaxed">{request.description}</p>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Device Photos</p>
              <div className="grid grid-cols-3 gap-3">
                {request.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Device ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          {request.user && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-3">Customer Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{request.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{request.user.email}</p>
                </div>
                {request.user.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{request.user.phone}</p>
                  </div>
                )}
                {request.user.city && (
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{request.user.city}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnosis Section */}
          {request.diagnosis ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Diagnosis</p>
              <p className="text-blue-700 mb-2">{request.diagnosis}</p>
              {request.estimatedCost && (
                <p className="text-sm font-bold text-blue-900">Estimated Cost: ${request.estimatedCost}</p>
              )}
              {request.estimatedTime && (
                <p className="text-sm text-blue-700">Estimated Time: {request.estimatedTime}</p>
              )}
            </div>
          ) : request.status === 'accepted' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-3">Add Diagnosis</p>
              <div className="space-y-3">
                <textarea
                  placeholder="Enter diagnosis details..."
                  value={diagnosisData.diagnosis}
                  onChange={(e) => setDiagnosisData({ ...diagnosisData, diagnosis: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Estimated Cost ($)"
                    value={diagnosisData.estimatedCost}
                    onChange={(e) => setDiagnosisData({ ...diagnosisData, estimatedCost: e.target.value })}
                    className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Estimated Time (e.g., 2 hours)"
                    value={diagnosisData.estimatedTime}
                    onChange={(e) => setDiagnosisData({ ...diagnosisData, estimatedTime: e.target.value })}
                    className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (diagnosisData.diagnosis) {
                      onAddDiagnosis(request.id, diagnosisData);
                    } else {
                      toast.error('Please enter diagnosis details');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Save Diagnosis
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {isNew && (
              <>
                <button onClick={() => { onAccept(request.id); onClose(); }}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                  Accept Request
                </button>
                <button onClick={() => { onReject(request.id, 'Not available'); onClose(); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Reject
                </button>
              </>
            )}

            {request.status === 'accepted' && (
              <button onClick={() => { onUpdateStatus(request.id, 'in_progress'); onClose(); }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Start Repair
              </button>
            )}

            {request.status === 'in_progress' && (
              <button onClick={() => { onUpdateStatus(request.id, 'completed'); onClose(); }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Mark as Complete
              </button>
            )}

            <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
