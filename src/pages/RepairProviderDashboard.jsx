import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Wrench, CheckCircle, Clock, XCircle, Plus, Loader2,
  Star, MapPin, Phone, TrendingUp, Package, AlertCircle
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import * as repairService from '../services/repairProviderService';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL = {
  requested: 'Requested',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function RepairProviderDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await repairService.getRepairRequests({ limit: 50 });
      setRequests(res.data.data.items);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, []);

  if (!['repair_provider', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleStatus = async (id, status) => {
    try {
      await repairService.updateRepairStatus(id, { status });
      setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Status updated to ${STATUS_LABEL[status]}`);
      loadRequests(); // Reload to get fresh data
    } catch { toast.error('Failed to update'); }
  };

  const handleAccept = async (id) => {
    try {
      await repairService.acceptRepairRequest(id);
      toast.success('Request accepted');
      loadRequests();
    } catch { toast.error('Failed to accept request'); }
  };

  const handleReject = async (id) => {
    try {
      await repairService.rejectRepairRequest(id, { reason: 'Not available' });
      toast.success('Request rejected');
      loadRequests();
    } catch { toast.error('Failed to reject request'); }
  };

  const pending = requests.filter(r => r.status === 'requested');
  const active = requests.filter(r => ['accepted', 'in_progress'].includes(r.status));
  const done = requests.filter(r => r.status === 'completed');

  const TABS = [
    ['overview', 'Overview'],
    ['pending', `Pending (${pending.length})`],
    ['active', `Active (${active.length})`],
    ['completed', 'Completed'],
  ];

  const RequestCard = ({ r, actions }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">{r.itemName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{r.description}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {r.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.city}</span>}
            <span>{new Date(r.createdAt).toLocaleDateString('en')}</span>
            {r.user && <span>by {r.user.name}</span>}
          </div>
        </div>
      </div>
      {actions && (
        <div className="flex gap-2 flex-wrap">
          {actions.map(a => (
            <button key={a.status} onClick={a.onClick || (() => handleStatus(r.id, a.status))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${a.primary ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Wrench className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Provider Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name} · Manage your repair jobs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : tab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: AlertCircle, label: 'Pending Requests', value: pending.length, color: 'yellow' },
              { icon: Clock, label: 'Active Jobs', value: active.length, color: 'purple' },
              { icon: CheckCircle, label: 'Completed', value: done.length, color: 'green' },
              { icon: Package, label: 'Total Requests', value: requests.length, color: 'orange' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white">
            <Wrench className="w-6 h-6 text-orange-100 mb-2" />
            <h3 className="font-bold text-lg mb-1">Repair Hub</h3>
            <p className="text-orange-100 text-sm">Accept and manage repair requests from the community. Each completed repair earns EcoKarma and extends device lifespan.</p>
          </div>

          {/* Pending requests preview */}
          {pending.length > 0 && (
            <div className="bg-white border border-yellow-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">New Requests</h3>
                <button onClick={() => setTab('pending')} className="text-xs text-orange-600 hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {pending.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.itemName}</p>
                      <p className="text-xs text-gray-400">{r.city} · {new Date(r.createdAt).toLocaleDateString('en')}</p>
                    </div>
                    <button onClick={() => handleAccept(r.id)}
                      className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 flex-shrink-0">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      ) : tab === 'pending' ? (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pending requests — all caught up!</p>
            </div>
          ) : pending.map(r => (
            <RequestCard key={r.id} r={r} actions={[
              { status: 'accepted', label: 'Accept', primary: true, onClick: () => handleAccept(r.id) },
              { status: 'cancelled', label: 'Decline', primary: false, onClick: () => handleReject(r.id) },
            ]} />
          ))}
        </div>

      ) : tab === 'active' ? (
        <div className="space-y-3">
          {active.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No active jobs</p>
          ) : active.map(r => (
            <RequestCard key={r.id} r={r} actions={[
              r.status === 'accepted' ? { status: 'in_progress', label: 'Start Work', primary: true } : null,
              { status: 'completed', label: 'Mark Complete', primary: true },
              { status: 'cancelled', label: 'Cancel', primary: false },
            ].filter(Boolean)} />
          ))}
        </div>

      ) : tab === 'completed' ? (
        <div className="space-y-3">
          {done.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No completed jobs yet</p>
          ) : done.map(r => <RequestCard key={r.id} r={r} actions={null} />)}
        </div>
      ) : null}
    </div>
  );
}
