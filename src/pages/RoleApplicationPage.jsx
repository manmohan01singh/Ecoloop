import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wrench, Recycle, Building2, Users, FileCheck2, AlertCircle,
  Clock, CheckCircle2, XCircle, HelpCircle, ArrowRight, UploadCloud,
  ChevronRight, RefreshCw, Send, Save
} from 'lucide-react';
import {
  getMyApplications, submitApplication, updateMyApplication
} from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, LoadingState, Badge } from '../components/ui';

const ALLOWED_ROLES = [
  {
    role: 'repair_provider',
    label: 'Repair Technician / Workshop',
    desc: 'Provide authorized electronics diagnostics, component-level repairs, and spare parts salvage.',
    icon: Wrench,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    role: 'recycler',
    label: 'Licensed Recycler & Dismantler',
    desc: 'Operate R2/e-Stewards compliant material recovery, precious metal refining, and shredding.',
    icon: Recycle,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    role: 'business',
    label: 'Circular Enterprise / Vendor',
    desc: 'List circular feedstocks, surplus electronics lots, and source verified secondary materials.',
    icon: Building2,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    role: 'organization',
    label: 'Community Organization / Waste Bank',
    desc: 'Host regional collection drives, run education campaigns, and mobilize civic e-waste triage.',
    icon: Users,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export default function RoleApplicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplications, setExistingApplications] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    requestedRole: location.state?.requestedRole || 'repair_provider',
    businessName: '',
    contactPerson: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    streetAddress: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.pincode || '',
    country: 'India',
    experienceYears: 1,
    specializations: '',
    servicesOffered: '',
    facilitiesDescription: '',
    documents: '',
    applicantNotes: '',
    status: 'pending' // or draft
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      const apps = res.data.data || [];
      setExistingApplications(apps);
      if (apps.length > 0) {
        // Most recent application
        const latest = apps[0];
        setActiveApplication(latest);
        if (latest.status === 'information_requested' || latest.status === 'draft') {
          setIsEditing(true);
          setFormData({
            requestedRole: latest.requestedRole,
            businessName: latest.businessName || '',
            contactPerson: latest.contactName || latest.contactPerson || '',
            contactPhone: latest.phone || latest.contactPhone || '',
            contactEmail: latest.email || latest.contactEmail || '',
            streetAddress: latest.address || latest.streetAddress || '',
            city: latest.city || '',
            state: latest.state || '',
            postalCode: latest.pincode || latest.postalCode || '',
            country: latest.country || 'India',
            experienceYears: latest.experienceYears || 1,
            specializations: Array.isArray(latest.specializations) ? latest.specializations.join(', ') : '',
            servicesOffered: Array.isArray(latest.servicesOffered) ? latest.servicesOffered.join(', ') : '',
            facilitiesDescription: latest.description || latest.facilitiesDescription || '',
            documents: Array.isArray(latest.documents) ? latest.documents.map(d => d.url || d.name || d).join('\n') : '',
            applicantNotes: latest.applicantNotes || '',
            status: latest.status
          });
        }
      }
    } catch {
      toast.error('Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleKey) => {
    setFormData(prev => ({ ...prev, requestedRole: roleKey }));
  };

  const handleSubmit = async (targetStatus = 'pending') => {
    if (!formData.businessName.trim()) {
      toast.error('Business / Organization name is required');
      return;
    }
    if (!formData.contactPhone.trim()) {
      toast.error('Contact phone number is required');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      toast.error('City and State are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: targetStatus,
        experienceYears: Number(formData.experienceYears) || 0,
        specializations: formData.specializations
          ? formData.specializations.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        servicesOffered: formData.servicesOffered
          ? formData.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        documents: formData.documents
          ? formData.documents.split('\n').map(d => d.trim()).filter(Boolean).map(url => ({ name: 'Verification Document', url }))
          : []
      };

      if (activeApplication && isEditing) {
        await updateMyApplication(activeApplication.id, payload);
        toast.success(targetStatus === 'draft' ? 'Draft saved' : 'Application updated and submitted for review!');
      } else {
        await submitApplication(payload);
        toast.success(targetStatus === 'draft' ? 'Draft application saved' : 'Professional application submitted for review!');
      }

      setIsEditing(false);
      await fetchApplications();
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState size="lg" message="Loading your professional application records..." />
      </div>
    );
  }

  // If user is already approved and has a professional role
  const isAlreadyProfessional = user?.role && !['user', 'guest'].includes(user.role);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" /> Professional Role Onboarding
        </div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Apply for Professional Partner Accreditation
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Unlock verified business badges, quote directly on community repair tickets, collect certified e-waste, and list industrial feedstock. Every application is reviewed by platform moderators.
        </p>
      </div>

      {/* Active Application Status Banner if exists */}
      {activeApplication && !isEditing && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Application #{activeApplication.id.slice(0, 8)}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeApplication.businessName}
              </h2>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                Requested Role: <span className="font-semibold text-slate-700">{activeApplication.requestedRole?.replace('_', ' ')}</span>
              </p>
            </div>

            {/* Status Tag */}
            <div>
              {activeApplication.status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Approved & Activated
                </span>
              )}
              {activeApplication.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-4 h-4" /> Pending Moderator Review
                </span>
              )}
              {activeApplication.status === 'under_review' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <RefreshCw className="w-4 h-4 animate-spin" /> In Active Review
                </span>
              )}
              {activeApplication.status === 'information_requested' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  <HelpCircle className="w-4 h-4" /> More Information Requested
                </span>
              )}
              {activeApplication.status === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <XCircle className="w-4 h-4" /> Application Not Approved
                </span>
              )}
            </div>
          </div>

          {/* Feedback & Rejection Reason */}
          {activeApplication.rejectionReason && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Reviewer Decision Rationale</p>
              <p className="text-sm text-rose-900 mt-1 leading-relaxed">{activeApplication.rejectionReason}</p>
            </div>
          )}

          {activeApplication.reviewNotes && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Reviewer Instructions</p>
              <p className="text-sm text-amber-900 mt-1 leading-relaxed">{activeApplication.reviewNotes}</p>
            </div>
          )}

          {/* Audit Log Timeline */}
          {activeApplication.auditLog?.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Audit Trail & History</h3>
              <div className="space-y-3">
                {activeApplication.auditLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 uppercase">{log.action?.replace('_', ' ')}</span>
                      {(log.note || log.notes) && <span className="text-slate-500"> — {log.note || log.notes}</span>}
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            {activeApplication.status === 'information_requested' && (
              <Button onClick={() => setIsEditing(true)} icon={RefreshCw}>
                Update & Re-Submit Application
              </Button>
            )}
            {activeApplication.status === 'rejected' && (
              <Button onClick={() => { setIsEditing(true); setActiveApplication(null); }} icon={RefreshCw}>
                Start New Application
              </Button>
            )}
            {activeApplication.status === 'approved' && (
              <Button asChild icon={ArrowRight}>
                <Link to={user?.role === 'repair_provider' ? '/repair-provider' : user?.role === 'recycler' ? '/recycler' : '/dashboard'}>
                  Go to Role Console
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Application Form */}
      {(!activeApplication || isEditing) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Step 1: Role Selection */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              1. Select Requested Professional Role
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Choose the operational track that aligns with your verified licenses, facilities, or technical services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ALLOWED_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.requestedRole === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">{r.label}</h3>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Entity & Contact Info */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              2. Entity & Contact Information
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Official registration name and contact details for verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Business / Organization Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Tech Diagnostics Lab"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Official Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="e.g. contact@apextech.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  max="50"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Location & Facility */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              3. Operational Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Plot 42, Electronics City Phase 1"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="560100"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Specializations & Documents */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              4. Technical Capabilities & Verification Evidence
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Specializations & Hardware (comma separated)
              </label>
              <input
                type="text"
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="Motherboard micro-soldering, Battery re-celling, Inverter repairs, Display delamination"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Services Offered (comma separated)
              </label>
              <input
                type="text"
                name="servicesOffered"
                value={formData.servicesOffered}
                onChange={handleChange}
                placeholder="Component Replacement, Data Recovery, PCB diagnostics, Ultrasonic Cleaning"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Document Links / Certifications (one per line)
              </label>
              <textarea
                name="documents"
                value={formData.documents}
                onChange={handleChange}
                rows={3}
                placeholder="https://example.com/iso-cert.pdf&#10;https://example.com/gst-registration.pdf"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Notes for Moderators
              </label>
              <textarea
                name="applicantNotes"
                value={formData.applicantNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Any additional information regarding your facilities, warranty policy, or tooling..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit('draft')}
              disabled={submitting}
              icon={Save}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit('pending')}
              disabled={submitting}
              icon={Send}
            >
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
