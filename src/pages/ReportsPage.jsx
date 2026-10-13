import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle, MapPin, ThumbsUp, Clock, Plus,
  ShieldAlert, CheckCircle, Search, Filter, Shield
} from 'lucide-react';
import { getReports, createReport, upvoteReport } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Badge, Card, StatCard, EmptyState, LoadingState } from '../components/ui';

const STATUS_STYLE = {
  reported: 'bg-amber-50 text-amber-800 border-amber-200',
  under_review: 'bg-blue-50 text-blue-800 border-blue-200',
  verified: 'bg-purple-50 text-purple-800 border-purple-200',
  assigned: 'bg-orange-50 text-orange-800 border-orange-200',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABEL = {
  reported: 'Reported',
  under_review: 'Under Review',
  verified: 'Verified by Field Crew',
  assigned: 'Assigned to Waste Bank',
  resolved: 'Hazard Resolved',
  rejected: 'Closed',
};

const CATEGORY_LABELS = {
  illegal_dumping: 'Illegal E-Waste Dumping',
  full_collection_point: 'Full Drop-off Bin',
  hazardous_waste: 'Battery / Chemical Leakage',
  blocked_drain: 'Hardware Blocking Waterway',
  burning_waste: 'Cable / Circuit Burning',
  other: 'General Waste Hazard',
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const { isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'illegal_dumping',
    address: '',
    city: ''
  });

  const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports({ limit: 50 });
      setReports(res.data.data.items || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpvote = async (id) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to verify community reports');
      return;
    }
    if (upvotedIds.has(id)) {
      toast('You already confirmed this report', { icon: 'ℹ️' });
      return;
    }
    try {
      await upvoteReport(id);
      setUpvotedIds(prev => new Set([...prev, id]));
      setReports(rs => rs.map(r => r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
      toast.success('Confirmation recorded! Elevates moderator priority.');
    } catch {
      toast.error('Unable to confirm report');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createReport(form);
      toast.success('Hazard report submitted! Alerting regional moderators.');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'illegal_dumping', address: '', city: '' });
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit report');
    } finally {
      setSaving(false);
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
      const matchSearch = !searchQuery ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [reports, categoryFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = reports.length;
    const unresolved = reports.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    return { total, unresolved, resolved };
  }, [reports]);

  if (loading) return <LoadingState size="lg" fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Hazard & Dumping Incidents
            </h1>
            <Badge variant="warning" size="sm">Civic Safety Desk</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Crowdsourced alerts for illegal electronic dumps, overflowing e-waste hubs, and toxic battery hazards.
          </p>
        </div>
        {isAuthenticated() && (
          <Button
            onClick={() => setShowModal(true)}
            icon={Plus}
            size="lg"
            variant="danger"
            className="shadow-sm"
          >
            File Incident Report
          </Button>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Active Incident Alerts"
          value={stats.unresolved}
          icon={AlertTriangle}
          color="amber"
          caption="Currently under review or active triage"
        />
        <StatCard
          label="Resolved Hazards"
          value={stats.resolved}
          icon={CheckCircle}
          color="emerald"
          caption="Cleared and safely recirculated by hubs"
        />
        <StatCard
          label="Total Community Filings"
          value={stats.total}
          icon={ShieldAlert}
          color="teal"
          caption="Verifiable geotagged reports on record"
        />
      </div>

      {/* ── TRANSPARENCY NOTICE BANNER ─────────────────────── */}
      <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block">Community Safety Verification Protocol:</span>
          Reports filed here are evaluated by certified waste bank moderators and field coordinators. For immediate chemical emergency or dangerous battery fires, also notify regional civil defense services.
        </div>
      </div>

      {/* ── SEARCH & CATEGORY BAR ─────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Incidents ({reports.length})
            </button>
            {Object.entries(CATEGORY_LABELS).slice(0, 4).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setCategoryFilter(k)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  categoryFilter === k
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incident, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── INCIDENT FEED ─────────────────────────────────── */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={reports.length === 0 ? "No active hazards reported" : "No matching reports found"}
          description={
            reports.length === 0
              ? "All registered collection hubs and regional drop-offs are currently clear."
              : "Try adjusting search query or category filters."
          }
          action={isAuthenticated() ? {
            label: 'Report an Incident',
            onClick: () => setShowModal(true),
            icon: Plus,
            variant: 'danger'
          } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredReports.map(r => {
            const hasUpvoted = upvotedIds.has(r.id);

            return (
              <div
                key={r.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 hover:shadow-md transition-all flex items-start gap-4"
              >
                {/* Upvote Confirm Button */}
                <button
                  onClick={() => handleUpvote(r.id)}
                  aria-label="Confirm incident"
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all min-w-[56px] ${
                    hasUpvoted
                      ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 mb-0.5 ${hasUpvoted ? 'text-red-600 fill-red-600' : ''}`} />
                  <span className="text-xs font-black">{r.upvotes || 0}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Verify</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[r.status] || STATUS_STYLE.reported}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      {CATEGORY_LABELS[r.category] || r.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1 text-base font-display">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    {r.address && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {r.address}{r.city ? `, ${r.city}` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {r.reporter && (
                      <span>Filed by {r.reporter.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUBMIT REPORT MODAL ────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="File Waste or Hazard Incident Report"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Incident Title *"
            value={form.title}
            onChange={(e) => setFormField('title', e.target.value)}
            placeholder="e.g. Battery pack dump behind industrial warehouse"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Incident Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setFormField('category', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setFormField('description', e.target.value)}
              rows={3}
              placeholder="Describe what kind of items are discarded, approximate quantity, and accessibility..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location / Landmark"
              value={form.address}
              onChange={(e) => setFormField('address', e.target.value)}
              placeholder="e.g. Jl. Sudirman No. 42"
            />
            <Input
              label="City / District"
              value={form.city}
              onChange={(e) => setFormField('city', e.target.value)}
              placeholder="e.g. Jakarta Selatan"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            disabled={saving}
            loading={saving}
            className="w-full font-bold shadow-md shadow-red-600/20"
          >
            {saving ? 'Submitting Report...' : 'File Hazard Report'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
