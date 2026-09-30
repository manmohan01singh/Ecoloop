import { useState, useEffect } from 'react';
import { Wrench, MapPin, CheckCircle, AlertCircle, Plus, Loader2, X, Clock, Phone } from 'lucide-react';
import { getProviders, getRepairRequests, createRepairRequest, updateRepairStatus } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};
const STATUS_LABEL = { requested: 'Requested', accepted: 'Accepted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

function RequestModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ itemName: '', category: '', description: '', city: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createRepairRequest(form);
      toast.success('Repair request sent!');
      onCreated(); onClose();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Request a Repair</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input value={form.itemName} onChange={e => set('itemName', e.target.value)} required placeholder="e.g. Samsung Washing Machine"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="smartphone, laptop, ac, etc."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={3}
              placeholder="Describe the damage or issue..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jakarta"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RepairPage() {
  const [tab, setTab] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (tab === 'providers') {
          const res = await getProviders({ type: 'repair' });
          setProviders(res.data.data);
        } else {
          const res = await getRepairRequests({ limit: 30 });
          setRequests(res.data.data.items);
        }
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [tab]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateRepairStatus(id, { status });
      toast.success(`Status updated: ${STATUS_LABEL[status]}`);
      const res = await getRepairRequests({ limit: 30 });
      setRequests(res.data.data.items);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Community</h1>
          <p className="text-gray-500 text-sm mt-1">Find service providers or submit a repair request</p>
        </div>
        {isAuthenticated() && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> Request Repair
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[['providers', 'Service Providers'], ['requests', 'Repair Requests']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : tab === 'providers' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  {p.verificationStatus === 'admin_verified' ? (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{p.businessName}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{p.city}
                </div>
                {p.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />{p.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-gray-400" />{p.completedJobs} jobs completed
                </div>
              </div>

              {p.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.specializations.slice(0, 3).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {providers.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No service providers registered yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{r.itemName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.city || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString('en')}
                    </span>
                    {r.estimatedCost && <span>Estimated: Rp {Number(r.estimatedCost).toLocaleString('en')}</span>}
                  </div>
                </div>
                {isAuthenticated() && r.user?.id === user?.id && r.status === 'in_progress' && (
                  <button onClick={() => handleStatusUpdate(r.id, 'completed')}
                    className="flex-shrink-0 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700">
                    Confirm Completed
                  </button>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No repair requests yet</p>
            </div>
          )}
        </div>
      )}

      {showModal && <RequestModal onClose={() => setShowModal(false)} onCreated={() => { setTab('requests'); }} />}
    </div>
  );
}
