import { useState, useRef } from 'react';
import {
  User, Camera, Mail, Phone, MapPin, FileText, Bell,
  Save, Loader2, CheckCircle, Shield, Star, Edit3
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';


const ROLE_BADGE = {
  user:           { label: 'Contributor',      color: 'bg-emerald-100 text-emerald-700' },
  moderator:      { label: 'Moderator',        color: 'bg-blue-100 text-blue-700' },
  recycler:       { label: 'Recycler',         color: 'bg-green-100 text-green-700' },
  repair_provider:{ label: 'Repair Provider',  color: 'bg-orange-100 text-orange-700' },
  business:       { label: 'Business',         color: 'bg-indigo-100 text-indigo-700' },
  organization:   { label: 'Organization',     color: 'bg-purple-100 text-purple-700' },
  admin:          { label: 'Admin',            color: 'bg-red-100 text-red-700' },
};

const VERIFICATION_BADGE = {
  unverified:         { label: 'Unverified',          color: 'bg-gray-100 text-gray-600' },
  community_verified: { label: 'Community Verified',  color: 'bg-blue-100 text-blue-700' },
  admin_verified:     { label: 'Admin Verified',      color: 'bg-emerald-100 text-emerald-700' },
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
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
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
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.user;
  const verBadge  = VERIFICATION_BADGE[user?.verificationStatus] || VERIFICATION_BADGE.unverified;

  const TABS = [['profile', 'Profile'], ['location', 'Location'], ['notifications', 'Notifications']];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* ── Avatar + identity card ─────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-200 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-emerald-600">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors border-2 border-white"
              title="Change photo"
            >
              {avatarUploading
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{user?.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${verBadge.color}`}>
                <Shield className="w-3 h-3" /> {verBadge.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                <Star className="w-3 h-3" /> {user?.ecoKarmaTotal || 0} karma
              </span>
            </div>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" /> Change Photo
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Personal Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+62 812..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input value={user?.email || ''} disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Bio
            </label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
              placeholder="Tell the community about yourself and your e-waste journey..."
              maxLength={500}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'location' && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Location & Address
          </h3>
          <p className="text-xs text-gray-500">Used to find nearby recycling centers, repair shops, and collection points.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
              placeholder="Jl. Example No. 123"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="DKI Jakarta"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="10110"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      )}

      {tab === 'notifications' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" /> Notification Preferences
          </h3>
          <p className="text-sm text-gray-500 mb-4">Choose which notifications you want to receive.</p>

          {[
            { key: 'repair', label: 'Repair Request Updates', desc: 'Get notified when your repair status changes' },
            { key: 'community', label: 'Community Activity', desc: 'Replies and mentions in communities' },
            { key: 'listings', label: 'Marketplace Activity', desc: 'Requests on your listings' },
            { key: 'karma', label: 'EcoKarma Earned', desc: 'When you earn karma for actions' },
            { key: 'challenges', label: 'Challenges & Events', desc: 'New challenges and upcoming events' },
            { key: 'reports', label: 'Report Updates', desc: 'Updates on your waste reports' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-500">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}

          <div className="pt-2">
            <button onClick={() => toast.success('Notification preferences saved!')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              <CheckCircle className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
