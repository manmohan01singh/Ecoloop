import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowLeft, Loader2, Shield, Calendar, MessageSquare, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { getCommunity, joinCommunity, leaveCommunity, getPosts, votePost, deletePost } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  ewaste: 'bg-blue-100 text-blue-700',
  repair: 'bg-orange-100 text-orange-700',
  recycling: 'bg-green-100 text-green-700',
  plastic: 'bg-cyan-100 text-cyan-700',
  textile: 'bg-purple-100 text-purple-700',
  sustainability: 'bg-emerald-100 text-emerald-700',
  circular_business: 'bg-indigo-100 text-indigo-700',
  waste_problems: 'bg-red-100 text-red-700',
  food_organic: 'bg-lime-100 text-lime-700',
  general: 'bg-gray-100 text-gray-700',
};

function PostCard({ post, onVote, onDelete, canModerate }) {
  const { isAuthenticated, user } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const handleVote = async (value) => {
    if (!isAuthenticated()) { toast.error('Log in to vote'); return; }
    const newValue = post.userVote === value ? 0 : value;
    try { await onVote(post.id, newValue); } catch { toast.error('Failed to vote'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await onDelete(post.id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = user?.id === post.author?.id || canModerate;

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
      <div className="flex">
        <div className="flex flex-col items-center gap-1 px-3 py-4 bg-gray-50 rounded-l-xl">
          <button onClick={() => handleVote(1)}
            className={`p-1 rounded hover:bg-emerald-100 transition-colors ${post.userVote === 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className={`text-sm font-bold ${post.userVote === 1 ? 'text-emerald-600' : post.userVote === -1 ? 'text-red-500' : 'text-gray-700'}`}>
            {post.upvotes - post.downvotes}
          </span>
          <button onClick={() => handleVote(-1)}
            className={`p-1 rounded hover:bg-red-100 transition-colors ${post.userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap text-xs text-gray-500">
            <span>by {post.author?.name}</span>
            <span className="text-gray-400">•</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.category && (
              <>
                <span className="text-gray-400">•</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general}`}>
                  {post.category.replace('_', ' ')}
                </span>
              </>
            )}
          </div>

          <Link to={`/community/post/${post.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors mb-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {post.body && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{post.body}</p>
          )}

          {/* Image strip */}
          {post.images?.length > 0 && (
            <Link to={`/community/post/${post.id}`} className="flex gap-1.5 mb-3 rounded-lg overflow-hidden">
              {post.images.slice(0, 3).map((url, i) => (
                <div key={i} className={`relative flex-1 rounded-lg overflow-hidden bg-gray-100 ${post.images.length === 1 ? 'h-48' : 'h-28'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" loading="lazy" />
                  {i === 2 && post.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">+{post.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </Link>
          )}

          <Link to={`/community/post/${post.id}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.commentCount} comments
          </Link>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isCommunityAdmin = community?.memberRole === 'admin';
  const isModerator = community?.memberRole === 'moderator' || isCommunityAdmin || isAdmin;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [communityRes, postsRes] = await Promise.all([
        getCommunity(slug),
        getPosts({ communitySlug: slug, limit: 30 }),
      ]);
      setCommunity(communityRes.data.data);
      setPosts(postsRes.data.data.items);
    } catch (err) {
      toast.error('Failed to load community');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleJoinLeave = async () => {
    if (!isAuthenticated()) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      if (community.isMember) {
        await leaveCommunity(community.id);
        toast.success('Left community');
        setCommunity({ ...community, isMember: false, memberCount: community.memberCount - 1 });
      } else {
        await joinCommunity(community.id);
        toast.success('Successfully joined!');
        setCommunity({ ...community, isMember: true, memberCount: community.memberCount + 1 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVote = async (postId, value) => {
    await votePost(postId, value);
    setPosts(ps => ps.map(p => p.id === postId ? {
      ...p,
      upvotes: value === 1 ? p.upvotes + (p.userVote === 1 ? -1 : 1) : p.upvotes + (p.userVote === 1 ? -1 : 0),
      downvotes: value === -1 ? p.downvotes + (p.userVote === -1 ? -1 : 1) : p.downvotes + (p.userVote === -1 ? -1 : 0),
      userVote: p.userVote === value ? 0 : value,
    } : p));
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    setPosts(ps => ps.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/community')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl overflow-hidden mb-6">
        {community.coverImage && (
          <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${community.coverImage})` }} />
        )}
        <div className="p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">c/{community.name}</h1>
                {community.isVerified && (
                  <Shield className="w-5 h-5 text-blue-300" title="Verified" />
                )}
                {isCommunityAdmin && (
                  <span className="text-xs bg-red-500/80 text-white px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
                {community.memberRole === 'moderator' && (
                  <span className="text-xs bg-blue-500/80 text-white px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Moderator
                  </span>
                )}
              </div>
              <p className="text-emerald-50 mb-4">{community.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-sm text-emerald-100">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.memberCount.toLocaleString()} members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {community.postCount.toLocaleString()} posts
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(community.createdAt).toLocaleDateString('en')}
                </span>
              </div>
            </div>
            <button
              onClick={handleJoinLeave}
              disabled={actionLoading}
              className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                community.isMember
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white text-emerald-600 hover:bg-emerald-50'
              }`}>
              {actionLoading ? 'Loading...' : community.isMember ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Posts</h2>
            {community.isMember && (
              <Link
                to="/community/create-post"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                <Plus className="w-4 h-4" /> Create Post
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No posts in this community yet</p>
              </div>
            ) : (
              posts.map(p => <PostCard key={p.id} post={p} onVote={handleVote} onDelete={handleDeletePost} canModerate={isModerator} />)
            )}
          </div>
        </div>

        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-3">About Community</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {community.description || 'No description'}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{community.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{community.isPrivate ? 'Private' : 'Public'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created by</span>
                <span className="font-medium">{community.creator?.name}</span>
              </div>
            </div>

            {community.rules && community.rules.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Rules</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                  {community.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
