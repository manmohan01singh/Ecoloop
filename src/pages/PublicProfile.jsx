import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, CheckCircle2, ShieldCheck, UserPlus, UserCheck,
  MessageSquare, ArrowUp, Flag, Globe, Wrench, Recycle, Building2,
  Award, Sparkles, ExternalLink, Lock
} from 'lucide-react';
import { getPublicProfile, getUserPublicPosts, getUserPublicReplies, toggleFollowUser, createReport } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, LoadingState, EmptyState, Modal, RoleBadge, Badge } from '../components/ui';

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followSubmitting, setFollowSubmitting] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublicProfile(username)
      .then((res) => {
        if (!isMounted) return;
        const data = res.data.data;
        setProfile(data);
        setFollowing(data.isFollowing);
        setFollowerCount(data.stats?.followersCount || 0);
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error(err.response?.data?.error?.message || 'Failed to load user profile');
        setProfile(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    let isMounted = true;

    if (activeTab === 'posts') {
      setPostsLoading(true);
      getUserPublicPosts(profile.username || profile.id, { limit: 20 })
        .then((res) => {
          if (!isMounted) return;
          setPosts(res.data.data?.items || []);
        })
        .catch(() => {
          if (!isMounted) return;
          setPosts([]);
        })
        .finally(() => {
          if (isMounted) setPostsLoading(false);
        });
    } else if (activeTab === 'replies') {
      setRepliesLoading(true);
      getUserPublicReplies(profile.username || profile.id, { limit: 20 })
        .then((res) => {
          if (!isMounted) return;
          setReplies(res.data.data?.items || []);
        })
        .catch(() => {
          if (!isMounted) return;
          setReplies([]);
        })
        .finally(() => {
          if (isMounted) setRepliesLoading(false);
        });
    }

    return () => { isMounted = false; };
  }, [profile, activeTab]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated()) {
      toast.error('Please log in to follow creators');
      navigate('/login');
      return;
    }
    if (followSubmitting || !profile) return;

    // Optimistic toggle
    const prevFollowing = following;
    const prevCount = followerCount;
    setFollowing(!prevFollowing);
    setFollowerCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);
    setFollowSubmitting(true);

    try {
      const res = await toggleFollowUser(profile.id);
      if (res.data?.success) {
        setFollowing(res.data.isFollowing);
        if (res.data.followerCount !== undefined) {
          setFollowerCount(res.data.followerCount);
        }
        toast.success(res.data.isFollowing ? `Following @${profile.username}` : `Unfollowed @${profile.username}`);
      }
    } catch (err) {
      // Revert optimistic update
      setFollowing(prevFollowing);
      setFollowerCount(prevCount);
      toast.error(err.response?.data?.error?.message || 'Failed to update follow status');
    } finally {
      setFollowSubmitting(false);
    }
  };

  const handleReportUser = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please log in to report');
      navigate('/login');
      return;
    }
    if (!reportDetails.trim()) {
      toast.error('Please provide report details');
      return;
    }

    setReporting(true);
    try {
      await createReport({
        title: `User Report: @${profile?.username} (${reportReason})`,
        description: `Target User: ${profile?.name} (@${profile?.username}, ID: ${profile?.id})\nReason: ${reportReason}\n\nDetails: ${reportDetails}`,
        category: 'waste_problems',
      });
      toast.success('Report submitted to moderators for investigation.');
      setReportModalOpen(false);
      setReportDetails('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingState size="lg" message="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="User not found"
          description={`We could not locate any public profile matching "@${username}".`}
          actionLabel="Explore Community"
          onAction={() => navigate('/community')}
        />
      </div>
    );
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : 'Unknown';

  const isVerifiedBadge = profile.verificationStatus === 'admin_verified' || profile.serviceDetails?.isVerified;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner / Cover */}
      <div className="h-44 sm:h-56 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 relative overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-opacity-20 bg-pattern opacity-30" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white shadow-md bg-emerald-600 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                {isVerifiedBadge && (
                  <span
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white"
                    title="Verified Platform Professional"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Name & Identity */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                    {profile.name}
                  </h1>
                  {isVerifiedBadge && (
                    <Badge variant="success" className="gap-1 py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </Badge>
                  )}
                  <RoleBadge role={profile.role} />
                </div>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  @{profile.username}
                </p>

                {/* City & Join Date (Strictly sanitized — no sensitive phone/address/pincode) */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                  {(profile.city || profile.state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {[profile.city, profile.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Joined {joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
              {profile.isOwnProfile ? (
                <Button variant="secondary" asChild>
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant={following ? 'secondary' : 'primary'}
                    onClick={handleToggleFollow}
                    disabled={followSubmitting}
                    icon={following ? UserCheck : UserPlus}
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportModalOpen(true)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Report User"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-700 mt-4 leading-relaxed max-w-3xl">
              {profile.bio}
            </p>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xl font-bold text-slate-900">{profile.stats?.postsCount || 0}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Posts</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xl font-bold text-slate-900">{followerCount}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Followers</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xl font-bold text-slate-900">{profile.stats?.followingCount || 0}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Following</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xl font-bold text-emerald-800">{profile.ecoKarmaTotal || 0}</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">EcoKarma</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 col-span-2 sm:col-span-1">
              <p className="text-xl font-bold text-slate-900">{profile.stats?.repairsCompleted || 0}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Repairs / Actions</p>
            </div>
          </div>
        </div>

        {/* Content Tabs or Private Notice */}
        {profile.isPrivate && !profile.isOwnProfile ? (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">This Account is Private</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              @{profile.username} has chosen to keep their activity and public posts private.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-700 hover:text-slate-900'
                }`}
              >
                Public Posts ({profile.stats?.postsCount || 0})
              </button>
            <button
              onClick={() => setActiveTab('replies')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'replies'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Replies & Comments ({profile.stats?.commentsCount || 0})
            </button>
            {profile.serviceDetails && (
              <button
                onClick={() => setActiveTab('services')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-700 hover:text-slate-900'
                }`}
              >
                Professional Services
              </button>
            )}
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              {postsLoading ? (
                <LoadingState size="md" message="Loading posts..." />
              ) : posts.length === 0 ? (
                <EmptyState
                  title="No posts published yet"
                  description={`@${profile.username} hasn't published any public community discussions yet.`}
                />
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">
                          {post.community ? `c/${post.community.name}` : 'General Discussion'}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/community/post/${post.id}`}>
                        <h3 className="font-bold text-slate-900 text-lg hover:text-emerald-600 transition-colors mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      {post.body && (
                        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                          {post.body}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                          {post.upvotes - post.downvotes} points
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount} comments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Replies Tab */}
          {activeTab === 'replies' && (
            <div>
              {repliesLoading ? (
                <LoadingState size="md" message="Loading replies..." />
              ) : replies.length === 0 ? (
                <EmptyState
                  title="No comments published yet"
                  description={`@${profile.username} hasn't posted any comments or replies yet.`}
                />
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">
                          {reply.post?.community ? `c/${reply.post.community.name}` : 'Community Discussion'}
                        </span>
                        <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      {reply.post && (
                        <div className="mb-2 text-xs text-slate-500">
                          <span>Replied on: </span>
                          <Link to={`/community/post/${reply.post.id}`} className="font-bold text-emerald-700 hover:underline">
                            "{reply.post.title}"
                          </Link>
                        </div>
                      )}
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                        {reply.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && profile.serviceDetails && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {profile.serviceDetails.businessName || profile.serviceDetails.role}
                  </h2>
                  <p className="text-sm text-slate-500 capitalize mt-0.5">
                    {profile.serviceDetails.type || profile.role.replace('_', ' ')}
                  </p>
                </div>
                {profile.serviceDetails.ratingAverage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">
                      ★ {profile.serviceDetails.ratingAverage}
                    </span>
                    <span className="text-xs text-amber-700">
                      ({profile.serviceDetails.completedJobs || 0} jobs)
                    </span>
                  </div>
                )}
              </div>

              {profile.serviceDetails.description && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {profile.serviceDetails.description}
                </p>
              )}

              {profile.serviceDetails.specializations?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Specializations & Hardware
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceDetails.specializations.map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.serviceDetails.acceptedMaterials?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Accepted Materials & Feedstock
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceDetails.acceptedMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.serviceDetails.website && (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a
                    href={profile.serviceDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    {profile.serviceDetails.website}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={`Report @${profile.username}`}
      >
        <form onSubmit={handleReportUser} className="space-y-4">
          <p className="text-sm text-slate-600">
            Reports are reviewed by platform moderators to ensure trust, authenticity, and compliance with platform standards.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="spam">Spam or Unsolicited Promotion</option>
              <option value="harassment">Harassment or Hate Speech</option>
              <option value="fake_credentials">Misrepresenting Professional Qualifications</option>
              <option value="fraud">Fraudulent Quotes or Services</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Details & Evidence
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={4}
              placeholder="Describe the issue in detail..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={reporting}
            >
              {reporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
