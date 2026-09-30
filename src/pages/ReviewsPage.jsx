import { useState, useEffect, useCallback } from 'react';
import { Star, Search, Loader2, X, CheckCircle, Trash2, Shield, Wrench, Recycle, Building2, User, ChevronDown } from 'lucide-react';
import {
  getReviewableUsers, getReviewsForUser,
  createReview, deleteReview, getMyGivenReviews,
} from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

// ── Role config ───────────────────────────────────────────────
const ROLE_CONFIG = {
  recycler:       { label: 'Recycler',        icon: Recycle,   color: 'bg-green-100 text-green-700',   border: 'border-green-200' },
  repair_provider:{ label: 'Repair Provider', icon: Wrench,    color: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
  organization:   { label: 'Organization',    icon: Building2, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
  user:           { label: 'User',            icon: User,      color: 'bg-gray-100 text-gray-600',     border: 'border-gray-200' },
};

const FILTER_ROLES = [
  { value: '',               label: 'All Types' },
  { value: 'recycler',       label: 'Recyclers' },
  { value: 'repair_provider',label: 'Repair Providers' },
  { value: 'organization',   label: 'Organizations' },
];

// ── StarRating — interactive or display ───────────────────────
function StarRating({ value = 0, onChange, size = 'md', showLabel = false }) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
  const active = hovered || value;

  if (!onChange) {
    // Display-only
    return (
      <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`${sizes[size]} ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
        ))}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star className={`${sizes[size]} transition-colors ${
              i <= active
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 fill-gray-300'
            }`} />
          </button>
        ))}
      </span>
      {showLabel && active > 0 && (
        <span className="text-sm font-medium text-amber-600">{labels[active]}</span>
      )}
    </div>
  );
}

// ── RatingBar — distribution bar ─────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-gray-600 font-medium text-right">{star}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400 text-right">{count}</span>
    </div>
  );
}

// ── ReviewCard ────────────────────────────────────────────────
function ReviewCard({ review, onDelete, isOwn }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.reviewer?.avatar ? (
            <img src={review.reviewer.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-emerald-700">{review.reviewer?.name?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{review.reviewer?.name}</p>
            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {review.isVerified && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
          {isOwn && (
            <button onClick={() => onDelete(review.id)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <StarRating value={review.rating} size="sm" />
        {review.title && (
          <p className="text-sm font-semibold text-gray-900 mt-2">{review.title}</p>
        )}
        {review.body && (
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
        )}
      </div>
    </div>
  );
}

// ── WriteReviewModal ──────────────────────────────────────────
function WriteReviewModal({ target, onClose, onSubmit, existing }) {
  const rc = ROLE_CONFIG[target.role] || ROLE_CONFIG.user;
  const RoleIcon = rc.icon;

  const [rating, setRating]   = useState(existing?.rating || 0);
  const [title, setTitle]     = useState(existing?.title  || '');
  const [body, setBody]       = useState(existing?.body   || '');
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    setSaving(true);
    try {
      await onSubmit({ revieweeId: target.id, revieweeType: target.role, rating, title, body });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            {target.avatar ? (
              <img src={target.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="font-bold text-gray-600">{target.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{target.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>
                {rc.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
            <StarRating value={rating} onChange={setRating} size="lg" showLabel />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-gray-400">(optional)</span></label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Summarise your experience..."
              maxLength={150}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder="Describe your experience in detail..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <button type="submit" disabled={saving || !rating}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Submitting...' : existing ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── UserProfileDrawer — reviews for a specific user ───────────
function UserProfileDrawer({ user: target, onClose, myReviews, onWriteReview }) {
  const [reviews, setReviews]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const { isAuthenticated, user: me } = useAuthStore();
  const rc = ROLE_CONFIG[target.role] || ROLE_CONFIG.user;
  const RoleIcon = rc.icon;

  const myExisting = myReviews.find(r => r.revieweeId === target.id);

  useEffect(() => {
    setLoading(true);
    getReviewsForUser(target.id)
      .then(res => {
        setReviews(res.data.data.reviews);
        setStats(res.data.data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [target.id]);

  const handleDelete = async (id) => {
    if (!confirm('Delete your review?')) return;
    try {
      await deleteReview(id);
      setReviews(rs => rs.filter(r => r.id !== id));
      if (stats) setStats(s => ({ ...s, totalReviews: s.totalReviews - 1 }));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <h2 className="font-bold text-gray-900">Reviews</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Profile summary */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${rc.border} bg-white`}>
            {target.avatar ? (
              <img src={target.avatar} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-gray-500">{target.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-lg truncate">{target.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
              {target.city && <p className="text-xs text-gray-400 mt-1">{target.city}</p>}
              {target.bio  && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{target.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                  <StarRating value={stats.avgRating} size="sm" />
                  <p className="text-xs text-gray-400 mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(s => (
                    <RatingBar key={s} star={s} count={stats.distribution[s]} total={stats.totalReviews} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Write / edit review CTA */}
          {isAuthenticated() && me?.id !== target.id && (
            <button
              onClick={() => onWriteReview(target)}
              className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                myExisting
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Star className="w-4 h-4" />
              {myExisting ? 'Edit Your Review' : 'Write a Review'}
            </button>
          )}

          {/* Reviews list */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No reviews yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  isOwn={r.reviewer?.id === me?.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ReviewsPage() {
  const { isAuthenticated, user } = useAuthStore();

  const [tab, setTab]           = useState('browse');
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [selectedUser, setSelected] = useState(null);
  const [writeTarget, setWriteTarget] = useState(null);
  const [myReviews, setMyReviews]   = useState([]);
  const [myLoading, setMyLoading]   = useState(false);

  // Load reviewable users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const res = await getReviewableUsers(params);
      setUsers(res.data.data.users);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Load my given reviews
  useEffect(() => {
    if (!isAuthenticated()) return;
    setMyLoading(true);
    getMyGivenReviews()
      .then(res => setMyReviews(res.data.data))
      .catch(() => {})
      .finally(() => setMyLoading(false));
  }, []);

  const handleSubmitReview = async (payload) => {
    try {
      await createReview(payload);
      toast.success('Review submitted!');
      // Refresh my reviews
      const res = await getMyGivenReviews();
      setMyReviews(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit review');
      throw err;
    }
  };

  const handleDeleteMyReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      setMyReviews(rs => rs.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const TABS = [
    ['browse', 'Browse & Review'],
    ...(isAuthenticated() ? [['given', 'My Reviews']] : []),
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Rate and review recyclers, repair providers, and organizations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or city..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRole(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {FILTER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* User grid */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                const RoleIcon = rc.icon;
                const myExisting = myReviews.find(r => r.revieweeId === u.id);
                return (
                  <div key={u.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-200 hover:shadow-md transition-all">
                    {/* User info */}
                    <div className="flex items-start gap-3 mb-4">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-gray-500">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>
                          {rc.label}
                        </span>
                        {u.city && <p className="text-xs text-gray-400 mt-0.5">{u.city}</p>}
                      </div>
                      {u.verificationStatus === 'admin_verified' && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" title="Admin Verified" />
                      )}
                    </div>

                    {/* Rating summary */}
                    <div className="flex items-center gap-2 mb-4">
                      <StarRating value={u.avgRating} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">
                        {u.avgRating > 0 ? u.avgRating.toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({u.totalReviews} review{u.totalReviews !== 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelected(u)}
                        className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        View Reviews
                      </button>
                      {isAuthenticated() && user?.id !== u.id && (
                        <button
                          onClick={() => setWriteTarget(u)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                            myExisting
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}>
                          <Star className="w-3.5 h-3.5" />
                          {myExisting ? 'Edit' : 'Review'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'given' && (
        <div className="space-y-3">
          {myLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : myReviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>You haven't written any reviews yet</p>
              <button onClick={() => setTab('browse')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
                Browse &amp; Review
              </button>
            </div>
          ) : myReviews.map(r => {
            const rc = ROLE_CONFIG[r.revieweeType] || ROLE_CONFIG.user;
            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {r.reviewee?.avatar ? (
                      <img src={r.reviewee.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-gray-500">{r.reviewee?.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{r.reviewee?.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setWriteTarget(r.reviewee ? { ...r.reviewee, role: r.revieweeType } : null)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteMyReview(r.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <StarRating value={r.rating} size="sm" />
                  {r.title && <p className="text-sm font-semibold text-gray-900 mt-1.5">{r.title}</p>}
                  {r.body  && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.body}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side drawer */}
      {selectedUser && (
        <UserProfileDrawer
          user={selectedUser}
          myReviews={myReviews}
          onClose={() => setSelected(null)}
          onWriteReview={(u) => { setSelected(null); setWriteTarget(u); }}
        />
      )}

      {/* Write/edit modal */}
      {writeTarget && (
        <WriteReviewModal
          target={writeTarget}
          existing={myReviews.find(r => r.revieweeId === writeTarget.id)}
          onClose={() => setWriteTarget(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
