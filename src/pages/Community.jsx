import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, TrendingUp, Flame, Clock, ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, Loader2 } from 'lucide-react';
import { getPosts, getCommunities } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: TrendingUp },
  { value: 'discussed', label: 'Most Discussed', icon: MessageSquare },
];

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

function PostCard({ post, onVote }) {
  const { isAuthenticated } = useAuthStore();

  const handleVote = async (value) => {
    if (!isAuthenticated()) { toast.error('Log in to vote'); return; }
    const newValue = post.userVote === value ? 0 : value;
    try { await onVote(post.id, newValue); } catch { toast.error('Failed to vote'); }
  };

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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.community && (
              <Link to={`/community/${post.community.slug}`}
                className="text-xs font-bold text-gray-900 hover:text-emerald-600">
                c/{post.community.name}
              </Link>
            )}
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">by {post.author?.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
            {post.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general}`}>
                {post.category.replace('_', ' ')}
              </span>
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

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link to={`/community/post/${post.id}`} className="flex items-center gap-1 hover:text-gray-700">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount} comments
            </Link>
            <button className="flex items-center gap-1 hover:text-gray-700">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button className="flex items-center gap-1 hover:text-gray-700">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [sort, setSort] = useState('hot');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (s = sort) => {
    setLoading(true);
    try {
      const res = await getPosts({ sort: s, limit: 30 });
      setPosts(res.data.data.items);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPosts();
    getCommunities({ limit: 8 }).then(r => setCommunities(r.data.data.items)).catch(() => {});
  }, []);

  const handleSort = (s) => { setSort(s); fetchPosts(s); };

  const handleVote = async (postId, value) => {
    const { votePost: vote } = await import('../services/communityService');
    await vote(postId, value);
    setPosts(ps => ps.map(p => p.id === postId ? {
      ...p,
      upvotes: value === 1 ? p.upvotes + (p.userVote === 1 ? -1 : 1) : p.upvotes + (p.userVote === 1 ? -1 : 0),
      downvotes: value === -1 ? p.downvotes + (p.userVote === -1 ? -1 : 1) : p.downvotes + (p.userVote === -1 ? -1 : 0),
      userVote: p.userVote === value ? 0 : value,
    } : p));
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500 text-sm mt-1">Discussions, tips, and circular actions</p>
        </div>
        <Link to="/community/create-post" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Create Post
        </Link>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => handleSort(s.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sort === s.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => <PostCard key={p.id} post={p} onVote={handleVote} />)}
              {posts.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No posts yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
          <div className="bg-gray-900 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2">About EcoLoop Community</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">A discussion space for the circular economy movement. Share tips, find solutions, and take action together.</p>
            <Link to="/community/create-post" className="block w-full text-center py-2 bg-emerald-500 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors">
              Create Post
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Popular Communities</h3>
              <Link to="/communities" className="text-xs text-emerald-600 hover:underline">All</Link>
            </div>
            <div className="space-y-2">
              {communities.map(c => (
                <Link key={c.id} to={`/community/${c.slug}`}
                  className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-1 transition-colors">
                  <span className="text-sm font-medium text-gray-800">c/{c.name}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />{c.memberCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CATEGORY_COLORS).map(c => (
                <Link key={c} to={`/community?category=${c}`}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[c]}`}>
                  {c.replace('_', ' ')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
