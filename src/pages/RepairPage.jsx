import { useState, useEffect } from 'react';
import {
  Wrench, MapPin, CheckCircle, AlertCircle, Plus, Clock, Phone,
  Shield, Star, Sparkles, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react';
import { getProviders, getRepairRequests, createRepairRequest, updateRepairStatus } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Tabs, Badge, Card, LoadingState, EmptyState } from '../components/ui';

const STATUS_MAP = {
  requested:   { label: 'Requested',   variant: 'warning' },
  accepted:    { label: 'Accepted',    variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'orange' },
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'neutral' },
};

function RequestModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ itemName: '', category: 'smartphone', description: '', city: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createRepairRequest(form);
      toast.success('Repair request submitted to verified technicians!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit repair ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a Certified Repair" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Device / Item Name *"
          value={form.itemName}
          onChange={(e) => set('itemName', e.target.value)}
          placeholder="e.g. Asus ROG Zephyrus G14"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop / PC</option>
              <option value="tablet">Tablet</option>
              <option value="appliance">Home Appliance</option>
              <option value="tv">TV / Display</option>
              <option value="audio">Audio / Other</option>
            </select>
          </div>

          <Input
            label="Location (City) *"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Jakarta Pusat"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Problem Diagnosis Notes *</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
            rows={3}
            placeholder="Describe symptoms: cracked screen, rapid battery drain, no power, thermal throttling..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
          💡 Verified local repair shops will review your ticket and provide repair cost estimates.
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={saving}>
          Submit Repair Ticket
        </Button>
      </form>
    </Modal>
  );
}

export default function RepairPage() {
  const [tab, setTab] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (tab === 'providers') {
        const res = await getProviders({ type: 'repair' });
        setProviders(res.data.data || []);
      } else {
        const res = await getRepairRequests({ limit: 30 });
        setRequests(res.data.data.items || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [tab]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateRepairStatus(id, { status });
      toast.success(`Ticket marked as ${status}`);
      fetchContent();
    } catch {
      toast.error('Failed to update ticket status');
    }
  };

  const tabsConfig = [
    { id: 'providers', label: 'Verified Service Workshops', badge: providers.length || undefined },
    { id: 'requests', label: 'Community Repair Tickets', badge: requests.length || undefined },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
            National Repair Network
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Connect with verified hardware technicians and extend your device's lifespan.
          </p>
        </div>

        {isAuthenticated() && (
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Create Repair Ticket
          </Button>
        )}
      </div>

      {/* ── TAB BAR ───────────────────────────────────────── */}
      <Tabs
        tabs={tabsConfig}
        activeTab={tab}
        onChange={setTab}
        variant="pill"
      />

      {/* ── TAB CONTENT ───────────────────────────────────── */}
      {loading ? (
        <LoadingState size="lg" />
      ) : tab === 'providers' ? (
        providers.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No repair workshops found"
            description="Be the first certified repair technician to list your workshop on EcoLoop."
            action={{
              label: 'Submit Repair Ticket',
              onClick: () => setShowModal(true),
              icon: Plus
            }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <Card key={p.id} variant="elevated" className="p-6 flex flex-col justify-between hover:border-emerald-300 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-6 h-6 text-orange-600" />
                    </div>
                    {p.verificationStatus === 'admin_verified' ? (
                      <Badge variant="brand" size="sm" dot>Verified Workshop</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Community Partner</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base font-display group-hover:text-emerald-700 transition-colors">
                      {p.businessName}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      {p.description || 'Experienced hardware and circuit board diagnostic technician.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{p.city || 'Indonesia'}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.completedJobs || 12} successful repairs recorded</span>
                    </div>
                  </div>

                  {p.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.specializations.slice(0, 3).map((s) => (
                        <Badge key={s} variant="neutral" size="sm">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowModal(true)}
                  >
                    Request Diagnostic Quote
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Requests Tab */
        requests.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No active repair tickets"
            description="Have a broken smartphone, laptop, or home appliance? Submit a ticket to get verified quotes."
            action={{
              label: 'Submit Repair Ticket',
              onClick: () => setShowModal(true),
              icon: Plus
            }}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const statusMeta = STATUS_MAP[r.status] || STATUS_MAP.requested;

              return (
                <Card key={r.id} variant="elevated" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm font-display">{r.itemName}</h3>
                      <Badge variant={statusMeta.variant} size="sm">
                        {statusMeta.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {r.city || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {r.estimatedCost && (
                        <span className="text-emerald-700 font-bold">
                          Est: Rp {Number(r.estimatedCost).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAuthenticated() && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.status === 'in_progress' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(r.id, 'completed')}
                        >
                          Confirm Fixed
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* ── MODAL ─────────────────────────────────────────── */}
      <RequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { setTab('requests'); fetchContent(); }}
      />
    </div>
  );
}
