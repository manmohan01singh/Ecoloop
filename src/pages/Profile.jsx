import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Camera, Mail, Phone, MapPin, FileText, Bell,
  Save, CheckCircle, Shield, Star, Edit3, KeyRound, Sparkles, ChevronRight
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Button, Input, Card, Badge } from '../components/ui';

const ROLE_BADGE = {
  user:           { label: 'Citizen Contributor', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  moderator:      { label: 'Content Moderator',   color: 'bg-blue-50 text-blue-800 border-blue-200' },
  recycler:       { label: 'Licensed Recycler',    color: 'bg-green-50 text-green-800 border-green-200' },
  repair_provider:{ label: 'Repair Technician',    color: 'bg-orange-50 text-orange-800 border-orange-200' },
  business:       { label: 'Enterprise B2B',       color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  organization:   { label: 'Waste Bank Partner',   color: 'bg-purple-50 text-purple-800 border-purple-200' },
  admin:          { label: 'System Admin',         color: 'bg-red-50 text-red-800 border-red-200' },
};

const VERIFICATION_BADGE = {
  unverified:         { label: 'Pending Verification', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  community_verified: { label: 'Community Verified',   color: 'bg-blue-50 text-blue-800 border-blue-200' },
  admin_verified:     { label: 'Official Gov/KLHK Verified', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    bio:     user?.bio     || '',
    address: user?.address || '',
    city:    user?.city    || '',
    state:   user?.state   || '',
    pincode: user?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [tab, setTab] = useState('profile');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      const updated = { ...user, ...res.data.data };
      updateUser(updated);
      toast.success('Account profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.data.url;
      setAvatarUrl(url);
      updateUser({ ...user, avatar: url });
      toast.success('Profile avatar updated!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.user;
  const verBadge  = VERIFICATION_BADGE[user?.verificationStatus] || VERIFICATION_BADGE.unverified;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
          Account Profile & Security
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your verified circular identity, regional pickup coordinates, and security preferences.
        </p>
      </div>

      {/* ── IDENTITY CARD ─────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Upload Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-emerald-50 border-2 border-emerald-200 overflow-hidden flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-emerald-700 font-display">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Upload profile photo"
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors border-2 border-white shadow-md text-white"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* User Details & Badges */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display truncate">
                {user?.name || 'Circuvio Member'}
              </h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center justify-center gap-1.5 w-fit mx-auto sm:mx-0">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {user?.ecoKarmaTotal || 0} EcoKarma
              </span>
            </div>
            <p className="text-sm text-gray-500">{user?.email}</p>

            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
              <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1 ${verBadge.color}`}>
                <Shield className="w-3.5 h-3.5" /> {verBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-2">
              <Link
                to={`/u/${user?.username || user?.id}`}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl transition-colors inline-flex items-center gap-1"
              >
                <span>View Public Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {user?.role === 'user' && (
                <Link
                  to="/apply"
                  className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-xl transition-colors inline-flex items-center gap-1"
                >
                  <span>Apply for Pro Role</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── TABS ──────────────────────────────────────────── */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'profile', label: 'Personal Information' },
          { id: 'location', label: 'Regional Coordinates' },
          { id: 'notifications', label: 'Preferences' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────── */}
      {tab === 'profile' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base font-display flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-emerald-600" /> Civic Identity Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full Display Name *"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your full name"
                required
              />
              <Input
                label="WhatsApp / Phone Number"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+62 812-3456-7890"
                icon={Phone}
              />
            </div>

            <div>
              <Input
                label="Registered Email (Account Key)"
                value={user?.email || ''}
                disabled
                icon={Mail}
                helperText="Primary email is locked for account safety and verification integrity."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Civic Bio & Sustainability Mission
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
                placeholder="Share your e-waste circular goals, repair expertise, or waste bank involvement..."
                maxLength={500}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">{form.bio.length} / 500 characters</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                loading={saving}
                icon={Save}
                size="md"
                className="font-bold shadow-md shadow-emerald-600/20"
              >
                {saving ? 'Updating Profile...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'location' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base font-display flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" /> Doorstep Collection & Regional Location
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enables certified waste banks and repair technicians to calculate doorstep transport estimates.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Street Address / Building
              </label>
              <textarea
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                rows={2}
                placeholder="Jl. Gatot Subroto No. 42, RT 02 / RW 05"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Input
                label="City / Regency"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Jakarta Selatan"
              />
              <Input
                label="Province"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                placeholder="DKI Jakarta"
              />
              <Input
                label="Postal Code"
                value={form.pincode}
                onChange={(e) => set('pincode', e.target.value)}
                placeholder="12950"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                loading={saving}
                icon={Save}
                size="md"
                className="font-bold shadow-md shadow-emerald-600/20"
              >
                {saving ? 'Updating Address...' : 'Save Location'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-base font-display flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-emerald-600" /> Alert & Communication Settings
          </h3>
          <p className="text-xs text-gray-500 mb-4">Control notifications delivered via app toast and verified email.</p>

          <div className="space-y-2.5">
            {[
              { key: 'repair', label: 'Hardware Repair Ticket Status', desc: 'Alerts when technician updates diagnostics or pickup' },
              { key: 'listings', label: 'Circular Marketplace Inquiries', desc: 'Real-time buyer offers and pickup requests' },
              { key: 'community', label: 'Civic Discussion Mentions', desc: 'Replies on your threads and community challenges' },
              { key: 'karma', label: 'EcoKarma Accrual Alerts', desc: 'Instant confirmations after verified waste bank weigh-ins' },
              { key: 'reports', label: 'Waste Incident Hazard Status', desc: 'Updates when municipal crews clear reported hazards' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-900">{n.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => toast.success('Notification preferences updated!')}
              icon={CheckCircle}
              size="md"
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
