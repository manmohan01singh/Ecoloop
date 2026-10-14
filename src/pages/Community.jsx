import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Plus, TrendingUp, Flame, Clock, ArrowUp, ArrowDown,
  MessageSquare, Share2, Bookmark, Flag,
  Search, X
} from 'lucide-react';
import {
  getPosts, getCommunities, votePost, toggleBookmarkPost, getMyBookmarks, createReport
} from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, LoadingState, EmptyState, Modal } from '../components/ui';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: TrendingUp },
  { value: 'discussed', label: 'Most Discussed', icon: MessageSquare },
  { value: 'saved', label: 'Saved', icon: Bookmark, requiresAuth: true },
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

function PostCard({ post, onVote, onBookmark, onOpenReport }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleVote = async (value) => {
    if (!isAuthenticated()) {
      toast.error('Log in to vote');
      navigate('/login');
      return;
    }
    const newValue = post.userVote === value ? 0 : value;
    try {
      await onVote(post.id, newValue);
    } catch {
      toast.error('Failed to vote');
    }
  };

  const handleBookmarkClick = () => {
    if (!isAuthenticated()) {
      toast.error('Log in to save posts to your bookmarks');
      navigate('/login');
      return;
    }
    onBookmark(post.id);
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Post link copied to clipboard!');
    } else {
      toast.success(postUrl);
    }
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const authorUsername = post.author?.username || post.author?.name?.toLowerCase().replace(/\s+/g, '_') || 'user';
  const authorProfileUrl = `/u/${authorUsername}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all shadow-xs">
      <div className="flex">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 px-3 py-4 bg-gray-50/80 rounded-l-xl border-r border-gray-100">
          <button
            onClick={() => handleVote(1)}
            aria-label={`Upvote post: ${post.title}`}
            className={`p-1 rounded hover:bg-emerald-100 transition-colors ${
              post.userVote === 1 ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span
            className={`text-xs font-bold ${
              post.userVote === 1
                ? 'text-emerald-600'
                : post.userVote === -1
                ? 'text-red-500'
                : 'text-gray-700'
            }`}
          >
            {post.upvotes - post.downvotes}
          </span>
          <button
            onClick={() => handleVote(-1)}
            aria-label={`Downvote post: ${post.title}`}
            className={`p-1 rounded hover:bg-red-100 transition-colors ${
              post.userVote === -1 ? 'text-red-500 bg-red-50' : 'text-gray-400'
            }`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-4 min-w-0">
          {/* Header Metadata */}
          <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
            {post.community && (
              <Link
                to={`/community/${post.community.slug}`}
                className="font-bold text-gray-900 hover:text-emerald-600"
              >
                c/{post.community.name}
              </Link>
            )}
            <span className="text-gray-300">•</span>

            {/* Author info with avatar and clickable username */}
            <div className="flex items-center gap-1.5">
              <Link
                to={authorProfileUrl}
                className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] hover:ring-2 hover:ring-emerald-400 transition-all overflow-hidden"
              >
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (post.author?.name?.charAt(0) || 'U').toUpperCase()
                )}
              </Link>
              <Link
                to={authorProfileUrl}
                className="font-medium text-gray-700 hover:text-emerald-700 hover:underline"
              >
                @{authorUsername}
              </Link>
            </div>

            <span className="text-gray-300">•</span>
            <span className="text-gray-400">{timeAgo(post.createdAt)}</span>

            {post.category && (
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${
                  CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general
                }`}
              >
                {post.category.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/community/post/${post.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors mb-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Body snippet */}
          {post.body && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {post.body}
            </p>
          )}

          {/* Image preview strip */}
          {post.images?.length > 0 && (
            <Link
              to={`/community/post/${post.id}`}
              className="flex gap-1.5 mb-3 rounded-lg overflow-hidden"
            >
              {post.images.slice(0, 3).map((url, i) => (
                <div
                  key={i}
                  className={`relative flex-1 rounded-lg overflow-hidden bg-gray-100 ${
                    post.images.length === 1 ? 'h-48' : 'h-28'
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  {i === 2 && post.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        +{post.images.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Link>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <Link
              to={`/community/post/${post.id}`}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount} comments
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              aria-label="Share post"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={handleBookmarkClick}
              className={`flex items-center gap-1 transition-colors ${
                post.isBookmarked
                  ? 'text-emerald-600 font-semibold'
                  : 'hover:text-gray-900 text-gray-500'
              }`}
              aria-label="Save post"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  post.isBookmarked ? 'fill-emerald-600 text-emerald-600' : ''
                }`}
              />
              {post.isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => onOpenReport(post)}
              className="flex items-center gap-1 hover:text-rose-600 text-gray-400 ml-auto transition-colors"
              title="Report post"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [sort, setSort] = useState('hot');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Reporting
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Keep searchInput aligned with URL param
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const fetchPosts = async (s = sort, cat = categoryFilter, q = searchQuery, pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      if (s === 'saved') {
        const res = await getMyBookmarks({ limit: 20, page: pageNum });
        const items = res.data.data.items || [];
        setPosts(prev => append ? [...prev, ...items] : items);
        setHasMore(res.data.data.page < res.data.data.pages);
      } else {
        const params = { sort: s, limit: 20, page: pageNum };
        if (cat) params.category = cat;
        if (q) params.search = q;
        const res = await getPosts(params);
        const items = res.data.data.items || [];
        setPosts(prev => append ? [...prev, ...items] : items);
        setHasMore(res.data.data.page < res.data.data.pages);
      }
      setPage(pageNum);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(sort, categoryFilter, searchQuery, 1, false);
  }, [sort, categoryFilter, searchQuery]);

  useEffect(() => {
    getCommunities({ limit: 8 })
      .then((r) => setCommunities(r.data.data.items))
      .catch(() => {});
  }, []);

  const handleSort = (s) => {
    setSort(s);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next);
  };

  const handleClearCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next);
  };

  const handleVote = async (postId, value) => {
    try {
      await votePost(postId, value);
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId
            ? {
                ...p,
                upvotes:
                  value === 1
                    ? p.upvotes + (p.userVote === 1 ? -1 : 1)
                    : p.upvotes + (p.userVote === 1 ? -1 : 0),
                downvotes:
                  value === -1
                    ? p.downvotes + (p.userVote === -1 ? -1 : 1)
                    : p.downvotes + (p.userVote === -1 ? -1 : 0),
                userVote: p.userVote === value ? 0 : value,
              }
            : p
        )
      );
    } catch {
      toast.error('Failed to register vote');
    }
  };

  const handleBookmark = async (postId) => {
    // Optimistic toggle
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
    try {
      const res = await toggleBookmarkPost(postId);
      const isSaved = res.data?.isBookmarked;
      toast.success(isSaved ? 'Post saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      // Revert
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        )
      );
      toast.error('Failed to update bookmark');
    }
  };

  const handleOpenReport = (post) => {
    setReportingPost(post);
    setReportReason('spam');
    setReportDetails('');
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Log in to report content');
      return;
    }
    if (!reportDetails.trim()) {
      toast.error('Please specify details for the report');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await createReport({
        title: `Community Post Flag: "${reportingPost?.title?.slice(0, 40)}" (${reportReason})`,
        description: `Post ID: ${reportingPost?.id}\nAuthor: ${reportingPost?.author?.name} (@${reportingPost?.author?.username})\nReason: ${reportReason}\n\nDetails: ${reportDetails}`,
        category: 'waste_problems',
      });
      toast.success('Thank you. The report has been dispatched to community moderators.');
      setReportingPost(null);
      setReportDetails('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const visibleSortOptions = SORT_OPTIONS.filter(
    (opt) => !opt.requiresAuth || isAuthenticated()
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Community Discussions</h1>
          <p className="text-gray-600 text-sm mt-1">
            Open circular knowledge, hardware repairs, reuse exchange, and civic actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} asChild>
            <Link to="/community/create-post">Create Post</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/apply">Become a Partner</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search discussions by topic, device, or keywords..."
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Active Filter Indicator */}
          {(categoryFilter || searchQuery) && (
            <div className="flex items-center gap-2 mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex-wrap">
              <span className="font-semibold text-emerald-800">Active filters:</span>
              {categoryFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Category: {categoryFilter.replace('_', ' ')}
                  <button onClick={handleClearCategory} className="hover:text-emerald-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Search: "{searchQuery}"
                  <button onClick={handleClearSearch} className="hover:text-emerald-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline ml-auto font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Sort tabs */}
          <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
            {visibleSortOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSort(s.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sort === s.value
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingState size="lg" message="Loading discussions..." />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={sort === 'saved' ? 'No saved posts' : 'No posts yet'}
              description={
                sort === 'saved'
                  ? 'Posts you bookmark will appear here for fast reference.'
                  : (categoryFilter || searchQuery)
                  ? 'No discussions matched your active filter or search keywords.'
                  : 'Be the first to start a discussion or ask a repair question!'
              }
              actionLabel="Create Post"
              onAction={() => navigate('/community/create-post')}
            />
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onVote={handleVote}
                  onBookmark={handleBookmark}
                  onOpenReport={handleOpenReport}
                />
              ))}

              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="secondary"
                    onClick={() => fetchPosts(sort, categoryFilter, searchQuery, page + 1, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading more discussions...' : 'Load More Discussions'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-sm">
            <h3 className="font-bold text-base mb-1.5 font-display">Circular Community</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Connect with verified recyclers, device repair technicians, and local zero-waste organizers.
            </p>
            <div className="space-y-2">
              <Link
                to="/community/create-post"
                className="block w-full text-center py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Create New Post
              </Link>
              <Link
                to="/apply"
                className="block w-full text-center py-2 bg-slate-700/80 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors"
              >
                Apply for Professional Role
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Popular Hubs</h3>
              <Link to="/communities" className="text-xs text-emerald-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {communities.map((c) => (
                <Link
                  key={c.id}
                  to={`/community/${c.slug}`}
                  className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800">c/{c.name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {c.memberCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Filter Topics</h3>
              {categoryFilter && (
                <button
                  onClick={handleClearCategory}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CATEGORY_COLORS).map((c) => {
                const isActive = categoryFilter === c;
                return (
                  <Link
                    key={c}
                    to={isActive ? '/community' : `/community?category=${c}`}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      CATEGORY_COLORS[c]
                    } ${
                      isActive ? 'ring-2 ring-emerald-600 ring-offset-1 font-bold' : 'hover:opacity-85'
                    }`}
                  >
                    {c.replace('_', ' ')}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Report Post Modal */}
      <Modal
        isOpen={!!reportingPost}
        onClose={() => setReportingPost(null)}
        title="Report Post to Moderation"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <p className="text-xs text-gray-600">
            Reporting: <span className="font-semibold text-gray-900">"{reportingPost?.title}"</span>
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Violation Type
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="spam">Spam / Unsolicited Promotion</option>
              <option value="harassment">Hate Speech or Harassment</option>
              <option value="scam">Fraudulent Quote / Fake Repair</option>
              <option value="misinformation">Hazardous E-Waste Handling Advice</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Details
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              placeholder="Provide context for moderators..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReportingPost(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isSubmittingReport}
            >
              {isSubmittingReport ? 'Submitting...' : 'Flag Post'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
