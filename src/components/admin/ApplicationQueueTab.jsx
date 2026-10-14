import { useState, useEffect } from 'react';
import {
  FileCheck2, Clock, CheckCircle2, XCircle, HelpCircle,
  Search, Filter, RefreshCw, Eye, Shield, AlertCircle,
  ExternalLink, User, Wrench, Recycle, Building2, Users
} from 'lucide-react';
import {
  getAdminApplicationsQueue, startApplicationReview,
  approveApplication, rejectApplication, requestMoreInfoApplication
} from '../../services/communityService';
import toast from 'react-hot-toast';
import { Button, Modal, LoadingState, EmptyState, Badge } from '../ui';

const ROLE_ICONS = {
  repair_provider: Wrench,
  recycler: Recycle,
  business: Building2,
  organization: Users
};

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  information_requested: { label: 'Info Requested', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export default function ApplicationQueueTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected application for detail review modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Review actions input state
  const [rejectionReason, setRejectionReason] = useState('');
  const [infoRequestNotes, setInfoRequestNotes] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeActionModal, setActiveActionModal] = useState(null); // 'reject' | 'info' | 'approve'

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.requestedRole = roleFilter;
      const res = await getAdminApplicationsQueue(params);
      setApplications(res.data.data.items || []);
    } catch {
      toast.error('Failed to load application queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, roleFilter]);

  const handleStartReview = async (appId) => {
    setActionLoading(true);
    try {
      const res = await startApplicationReview(appId);
      toast.success('Application marked as Under Review');
      setSelectedApp(res.data.data);
      await fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to start review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const res = await approveApplication(selectedApp.id, { reviewNotes });
      toast.success(`Application approved! User promoted to ${res.data.userRole || selectedApp.requestedRole}.`);
      setActiveActionModal(null);
      setSelectedApp(null);
      setReviewNotes('');
      await fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('A rejection reason is strictly required for applicant feedback.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectApplication(selectedApp.id, { rejectionReason });
      toast.success('Application rejected with feedback');
      setActiveActionModal(null);
      setSelectedApp(null);
      setRejectionReason('');
      await fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoRequestNotes.trim()) {
      toast.error('Please specify what information or evidence is required');
      return;
    }
    setActionLoading(true);
    try {
      await requestMoreInfoApplication(selectedApp.id, { notes: infoRequestNotes });
      toast.success('Applicant notified to supply additional documentation');
      setActiveActionModal(null);
      setSelectedApp(null);
      setInfoRequestNotes('');
      await fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to request info');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const applicantUser = app.applicant || app.user;
    const contact = app.contactName || app.contactPerson;
    return (
      app.businessName?.toLowerCase().includes(term) ||
      contact?.toLowerCase().includes(term) ||
      applicantUser?.name?.toLowerCase().includes(term) ||
      applicantUser?.username?.toLowerCase().includes(term) ||
      app.city?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.contactEmail?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Professional Role Accreditation Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant licenses, workshops, certifications, and manage role promotion guardrails.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchQueue}
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search business, applicant, city..."
            className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="information_requested">Info Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="repair_provider">Repair Provider</option>
            <option value="recycler">Recycler</option>
            <option value="business">Circular Business</option>
            <option value="organization">Organization</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <LoadingState size="lg" message="Loading applicant queue..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications in this queue"
          description="There are currently no professional partner applications matching your search or filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Business & Applicant</th>
                  <th className="px-4 py-3.5">Requested Track</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Experience</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApps.map((app) => {
                  const RoleIcon = ROLE_ICONS[app.requestedRole] || FileCheck2;
                  const statusMeta = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.businessName}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {app.applicant?.name || app.user?.name || app.contactName || app.contactPerson || 'Applicant'} ({app.applicant?.username || app.user?.username ? `@${app.applicant?.username || app.user?.username}` : (app.email || app.contactEmail || 'N/A')})
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 capitalize">
                          <RoleIcon className="w-3.5 h-3.5 text-slate-600" />
                          {app.requestedRole.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {[app.city, app.state].filter(Boolean).join(', ') || 'N/A'}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {app.experienceYears} yrs
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500 text-[11px]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewNotes('');
                            setRejectionReason('');
                            setInfoRequestNotes('');
                          }}
                          icon={Eye}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DETAILED REVIEW MODAL ───────────────────────── */}
      <Modal
        isOpen={!!selectedApp && !activeActionModal}
        onClose={() => setSelectedApp(null)}
        title={`Review Application: ${selectedApp?.businessName || ''}`}
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Top Identity banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Application #{selectedApp.id.slice(0, 8)}</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedApp.businessName}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Applicant: <span className="font-semibold">{selectedApp.applicant?.name || selectedApp.user?.name || selectedApp.contactName || selectedApp.contactPerson || 'Applicant'}</span> (@{selectedApp.applicant?.username || selectedApp.user?.username || 'user'}) • Current Role: <span className="capitalize font-semibold text-emerald-700">{selectedApp.applicant?.role || selectedApp.user?.role || 'user'}</span>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedApp.status]?.color}`}>
                {STATUS_CONFIG[selectedApp.status]?.label}
              </span>
            </div>

            {/* Requested Role & Guardrail Warning */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Role Elevation Target: <span className="uppercase">{selectedApp.requestedRole.replace('_', ' ')}</span></p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Approval strictly updates this user's operational role to "{selectedApp.requestedRole}" and provisions corresponding database profile records. Admins and moderator roles cannot be granted through this pipeline.
                </p>
              </div>
            </div>

            {/* Entity & Verification Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Contact Details</p>
                <div><span className="font-semibold text-slate-500">Contact Person:</span> {selectedApp.contactName || selectedApp.contactPerson || selectedApp.applicant?.name || 'N/A'}</div>
                <div><span className="font-semibold text-slate-500">Phone:</span> {selectedApp.phone || selectedApp.contactPhone || 'N/A'}</div>
                <div><span className="font-semibold text-slate-500">Official Email:</span> {selectedApp.email || selectedApp.contactEmail || selectedApp.applicant?.email || 'N/A'}</div>
                <div><span className="font-semibold text-slate-500">Experience:</span> {selectedApp.experienceYears ? `${selectedApp.experienceYears} Years` : 'Not specified'}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Operational Facility</p>
                <div><span className="font-semibold text-slate-500">Address:</span> {selectedApp.address || selectedApp.streetAddress || 'Not specified'}</div>
                <div><span className="font-semibold text-slate-500">City / State:</span> {[selectedApp.city, selectedApp.state, selectedApp.pincode || selectedApp.postalCode].filter(Boolean).join(', ') || 'N/A'}</div>
                <div><span className="font-semibold text-slate-500">Country:</span> {selectedApp.country || 'India'}</div>
              </div>
            </div>

            {/* Capabilities */}
            {selectedApp.specializations?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.specializations.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Document Evidence */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Verification Documents & Links</p>
              {selectedApp.documents?.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url || doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-xs text-slate-800 transition-colors"
                    >
                      <span className="font-medium truncate max-w-md">{doc.name || doc.url || doc}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No external documents attached.</p>
              )}
            </div>

            {/* Audit Log Trail */}
            {selectedApp.auditLog?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Audit Trail</p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedApp.auditLog.map((log, i) => (
                    <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-800 uppercase text-[10px]">{log.action?.replace('_', ' ')}</span>
                        {(log.note || log.notes) && <p className="text-slate-600 text-xs mt-0.5">{log.note || log.notes}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              {selectedApp.status === 'pending' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartReview(selectedApp.id)}
                  loading={actionLoading}
                >
                  Start Active Review
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveActionModal('info')}
                  disabled={actionLoading}
                >
                  Request Info
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setActiveActionModal('reject')}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveActionModal('approve')}
                  disabled={actionLoading}
                >
                  Approve Role
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── APPROVE MODAL ───────────────────────────────── */}
      <Modal
        isOpen={activeActionModal === 'approve'}
        onClose={() => setActiveActionModal(null)}
        title="Confirm Application Approval"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            You are about to promote <span className="font-bold">@{selectedApp?.user?.username}</span> to the verified operational role of <span className="font-bold text-emerald-700 uppercase">{selectedApp?.requestedRole.replace('_', ' ')}</span>.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Reviewer Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              placeholder="Internal verification notes (e.g. Verified license against registry)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setActiveActionModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove} loading={actionLoading}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── REJECT MODAL ────────────────────────────────── */}
      <Modal
        isOpen={activeActionModal === 'reject'}
        onClose={() => setActiveActionModal(null)}
        title="Reject Professional Application"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            A comprehensive rejection explanation is required to give the applicant transparent feedback on missing qualifications or failed verification.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Explain why this application was not approved (e.g. Expired waste handler permit, unable to verify physical workshop address)..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setActiveActionModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── REQUEST INFO MODAL ──────────────────────────── */}
      <Modal
        isOpen={activeActionModal === 'info'}
        onClose={() => setActiveActionModal(null)}
        title="Request Additional Information"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            The applicant will receive an alert and will be allowed to update their application with the requested documents.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Information / Document Instructions *
            </label>
            <textarea
              value={infoRequestNotes}
              onChange={(e) => setInfoRequestNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Please provide a copy of your valid municipal waste dismantling permit..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setActiveActionModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRequestInfo} loading={actionLoading}>
              Send Request to Applicant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
