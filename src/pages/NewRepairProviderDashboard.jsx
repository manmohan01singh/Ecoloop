import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Wrench, Clock, CheckCircle, AlertCircle, Calendar, Users, 
  DollarSign, Star, Settings, Package, Recycle, Image, 
  MessageSquare, MapPin, Phone, Mail, Loader2, Search,
  Eye, X, Check, XCircle, TrendingUp, Award, RefreshCw,
  FileText, Camera, Hammer, Save, Edit
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

const CATEGORIES = [
  'Mobile', 'Laptop', 'TV', 'Gaming Console', 'Appliances', 
  'Computer', 'Tablet', 'Monitor', 'Printer', 'Other'
];

export default function NewRepairProviderDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState({ specializations: [], acceptedMaterials: [] });
  const [reviews, setReviews] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const res = await repairService.getDashboard();
      setDashboardData(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  // Load repair requests
  const loadRequests = async (status = filterStatus) => {
    setLoading(true);
    try {
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (filterCategory) params.category = filterCategory;
      if (searchTerm) params.search = searchTerm;
      
      const res = await repairService.getRepairRequests(params);
      setRequests(res.data.data.items);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await repairService.getCustomers();
      setCustomers(res.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  // Load services
  const loadServices = async () => {
    try {
      const res = await repairService.getServices();
      setServices(res.data.data);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  // Load reviews
  const loadReviews = async () => {
    try {
      const res = await repairService.getReviews();
      setReviews(res.data.data.reviews);
    } catch (error) {
      toast.error('Failed to load reviews');
    }
  };

  useEffect(() => {
    loadDashboard();
    loadRequests();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'requests') loadRequests();
    if (tab === 'customers') loadCustomers();
    if (tab === 'services') loadServices();
    if (tab === 'reviews') loadReviews();
  }, [tab]);

  if (!['repair_provider', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Accept request
  const handleAccept = async (id) => {
    try {
      await repairService.acceptRepairRequest(id);
      toast.success('Request accepted');
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to accept request');
    }
  };

  // Reject request
  const handleReject = async (id, reason) => {
    try {
      await repairService.rejectRepairRequest(id, { reason });
      toast.success('Request rejected');
      loadRequests();
      loadDashboard();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  // Update status
  const handleStatusUpdate = async (id, status, additionalData = {}) => {
    try {
      await repairService.updateRepairStatus(id, { status, ...additionalData });
      toast.success('Status updated');
      loadRequests();
      loadDashboard();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Add diagnosis
  const handleAddDiagnosis = async (id, diagnosisData) => {
    try {
      await repairService.addDiagnosis(id, diagnosisData);
      toast.success('Diagnosis added');
      loadRequests();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to add diagnosis');
    }
  };

  // Record e-waste
  const handleRecordEWaste = async (ewasteData) => {
    try {
      await repairService.recordEWaste(ewasteData);
      toast.success('E-waste recorded successfully');
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to record e-waste');
    }
  };

  // Open request details modal
  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setModalType('details');
    setShowModal(true);
  };

  const stats = dashboardData?.stats || {};

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repair Provider Hub</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.name}</p>
          </div>
        </div>
        <button onClick={() => { loadDashboard(); loadRequests(); }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto bg-gray-50 p-1 rounded-xl">
        {[
          ['dashboard', 'Dashboard', TrendingUp],
          ['requests', 'Repair Requests', Wrench],
          ['customers', 'Customers', Users],
          ['services', 'My Services', Hammer],
          ['reviews', 'Reviews', Star],
          ['profile', 'Profile', Settings],
        ].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              tab === key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={AlertCircle} label="New Requests" value={stats.newRequests || 0} color="yellow" />
            <StatCard icon={Clock} label="Active Repairs" value={stats.activeRepairs || 0} color="purple" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedRepairs || 0} color="green" />
            <StatCard icon={Calendar} label="Today's Jobs" value={stats.todaysAppointments || 0} color="blue" />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue || '0.00'}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stats.rating || '0.0'}</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-400">{stats.totalReviews || 0} reviews</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{customers.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {dashboardData.recentActivity.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openRequestModal(req)}>
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
        </div>
      )}

      {/* Repair Requests Tab */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadRequests()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); loadRequests(e.target.value); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">All Requests</option>
                <option value="new">New Requests</option>
                <option value="mine">My Requests</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); loadRequests(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No repair requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map(req => (
                <RequestCard key={req.id} request={req} onAccept={handleAccept} onReject={(id) => {
                  setSelectedRequest(req);
                  setModalType('reject');
                  setShowModal(true);
                }} onView={() => openRequestModal(req)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {tab === 'customers' && (
        <CustomersTab customers={customers} />
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <ServicesTab services={services} onUpdate={(data) => {
          repairService.updateServices(data).then(() => {
            toast.success('Services updated');
            loadServices();
          }).catch(() => toast.error('Failed to update services'));
        }} />
      )}

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <ReviewsTab reviews={reviews} rating={stats.rating} totalReviews={stats.totalReviews} />
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <ProfileTab provider={dashboardData?.provider} onUpdate={(data) => {
          repairService.updateProfile(data).then(() => {
            toast.success('Profile updated');
            loadDashboard();
          }).catch(() => toast.error('Failed to update profile'));
        }} />
      )}

      {/* Modals */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} type={modalType} request={selectedRequest}
          onReject={handleReject} onStatusUpdate={handleStatusUpdate} onDiagnosisSubmit={handleAddDiagnosis}
          onEWasteSubmit={handleRecordEWaste} />
      )}
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
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Request Card Component
function RequestCard({ request, onAccept, onReject, onView }) {
  const isNew = !request.providerId && request.status === 'requested';
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{request.itemName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[request.status]}`}>
              {request.status.replace('_', ' ')}
            </span>
            {isNew && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">NEW</span>}
          </div>
          
          {request.category && (
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mb-2">{request.category}</span>
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
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Diagnosis</p>
              <p className="text-sm text-blue-700">{request.diagnosis}</p>
              {request.estimatedCost && (
                <p className="text-sm font-semibold text-blue-900 mt-1">Est. Cost: ${request.estimatedCost}</p>
              )}
            </div>
          )}
        </div>

        {request.images && request.images.length > 0 && (
          <div className="flex-shrink-0">
            <img src={request.images[0]} alt="Device" className="w-20 h-20 object-cover rounded-lg" />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button onClick={() => onView()} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        
        {isNew && (
          <>
            <button onClick={() => onAccept(request.id)} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button onClick={() => onReject(request.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {request.status === 'accepted' && (
          <button onClick={() => onView()} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Start Repair
          </button>
        )}

        {request.status === 'in_progress' && (
          <button onClick={() => onView()} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Customers</h2>
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No customers yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {customer.totalRepairs} repairs · {customer.completedRepairs} completed
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

  const handleSave = () => {
    onUpdate({ specializations, acceptedMaterials: materials });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Services</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Specializations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Specializations</h3>
            {editing && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="Add specialization..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSpec.trim()) {
                      setSpecializations([...specializations, newSpec.trim()]);
                      setNewSpec('');
                    }
                  }}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm flex items-center gap-2">
                  {spec}
                  {editing && (
                    <button onClick={() => setSpecializations(specializations.filter((_, i) => i !== idx))} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {specializations.length === 0 && <p className="text-gray-400 text-sm">No specializations added</p>}
            </div>
          </div>

          {/* Accepted Materials */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Accepted Device Types</h3>
            {editing && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add device type..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMaterial.trim()) {
                      setMaterials([...materials, newMaterial.trim()]);
                      setNewMaterial('');
                    }
                  }}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {materials.map((mat, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                  {mat}
                  {editing && (
                    <button onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {materials.length === 0 && <p className="text-gray-400 text-sm">No device types added</p>}
            </div>
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
      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{rating || '0.0'}</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-700">{review.body}</p>
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

  const handleSave = () => {
    onUpdate(formData);
    setEditing(false);
  };

  if (!provider) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" /></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Provider Profile</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={!editing}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
          <input
            type="number"
            value={formData.serviceRadius}
            onChange={(e) => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })}
            disabled={!editing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{provider.completedJobs || 0}</p>
            <p className="text-sm text-gray-500">Completed Jobs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{provider.ratingCount || 0}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{provider.serviceRadius || 0} km</p>
            <p className="text-sm text-gray-500">Service Radius</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{provider.verificationStatus}</p>
            <p className="text-sm text-gray-500">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ onClose, type, request, onReject, onStatusUpdate, onDiagnosisSubmit, onEWasteSubmit }) {
  const [rejectReason, setRejectReason] = useState('');
  const [diagnosisData, setDiagnosisData] = useState({ diagnosis: '', estimatedCost: '', estimatedTime: '', requiredParts: [] });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {type === 'details' ? 'Request Details' : type === 'reject' ? 'Reject Request' : 'Add Diagnosis'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {type === 'details' && request && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Device</p>
                <p className="text-lg font-semibold text-gray-900">{request.itemName}</p>
                {request.category && <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{request.category}</span>}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Problem Description</p>
                <p className="text-gray-900">{request.description}</p>
              </div>

              {request.user && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">Customer Information</p>
                  <div className="space-y-1">
                    <p className="text-gray-900"><strong>Name:</strong> {request.user.name}</p>
                    <p className="text-gray-900"><strong>Email:</strong> {request.user.email}</p>
                    {request.user.phone && <p className="text-gray-900"><strong>Phone:</strong> {request.user.phone}</p>}
                    {request.user.city && <p className="text-gray-900"><strong>Location:</strong> {request.user.city}</p>}
                  </div>
                </div>
              )}

              {request.images && request.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {request.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Device ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {!request.providerId && request.status === 'requested' && (
                  <>
                    <button onClick={() => { onStatusUpdate(request.id, 'accepted'); onClose(); }}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Accept Request
                    </button>
                    <button onClick={() => { setRejectReason(''); onReject(request.id, 'Not available'); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                      Reject
                    </button>
                  </>
                )}

                {request.status === 'accepted' && (
                  <button onClick={() => { onStatusUpdate(request.id, 'in_progress'); onClose(); }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Start Repair
                  </button>
                )}

                {request.status === 'in_progress' && (
                  <button onClick={() => { onStatusUpdate(request.id, 'completed'); onClose(); }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          )}

          {type === 'reject' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection (optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Let the customer know why you're declining..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { onReject(request.id, rejectReason); }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Confirm Rejection
                </button>
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
