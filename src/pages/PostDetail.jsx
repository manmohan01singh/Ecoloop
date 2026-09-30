import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageSquare, ArrowLeft, Loader2, Send } from 'lucide-react';
import { getPost, votePost, addComment } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = { ewaste: 'bg-blue-100 text-blue-700', repair: 'bg-orange-100 text-orange-700', recycling: 'bg-green-100 text-green-700', plastic: 'bg-cyan-100 text-cyan-700', sustainability: 'bg-emerald-100 text-emerald-700', general: 'bg-gray-100 text-gray-700' };

function CommentItem({ comment, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { id } = useParams();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, { body: replyText, parentId: comment.id });
      toast.success('Reply sent!');
      setReplyText('');
      setShowReply(false);
    } catch { toast.error('Failed to send reply'); }
    finally { setSubmitting(false); }
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 3600) return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  };

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-emerald-700">{comment.author?.name?.[0]}</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">{comment.author?.name}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)} ago</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.body}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{comment.upvotes - comment.downvotes} points</span>
          {isAuthenticated() && depth < 3 && (
            <button onClick={() => setShowReply(!showReply)} className="text-xs text-gray-500 hover:text-emerald-600 font-medium">
              Reply
            </button>
          )}
        </div>

        {showReply && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..." className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="submit" disabled={submitting}
              className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
      {comment.replies?.map(r => <CommentItem key={r.id} comment={r} depth={depth + 1} />)}
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    getPost(id).then(r => setPost(r.data.data)).catch(() => toast.error('Post not found')).finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (value) => {
    if (!isAuthenticated()) { toast.error('Log in to vote'); return; }
    try {
      const newVal = post.userVote === value ? 0 : value;
      await votePost(id, newVal);
      setPost(p => ({ ...p, userVote: newVal, upvotes: p.upvotes + (newVal === 1 ? 1 : p.userVote === 1 ? -1 : 0), downvotes: p.downvotes + (newVal === -1 ? 1 : p.userVote === -1 ? -1 : 0) }));
    } catch { toast.error('Failed to vote'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(id, { body: comment });
      setPost(p => ({ ...p, comments: [...(p.comments || []), res.data.data], commentCount: p.commentCount + 1 }));
      setComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to send comment'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  if (!post) return <div className="text-center py-16 text-gray-400">Post not found</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link to="/community" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap text-xs text-gray-500">
          {post.community && (
            <Link to={`/community/${post.community.slug}`} className="font-bold text-gray-900 hover:text-emerald-600">
              c/{post.community.name}
            </Link>
          )}
          <span>•</span>
          <span>by {post.author?.name}</span>
          {post.category && <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general}`}>{post.category.replace('_', ' ')}</span>}
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h1>
        {post.body && <p className="text-gray-700 leading-relaxed mb-5">{post.body}</p>}

        {/* Post images */}
        {post.images?.length > 0 && (
          <div className={`mb-5 ${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
            {post.images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity">
                <img
                  src={url}
                  alt={`Post image ${i + 1}`}
                  className={`w-full object-cover ${post.images.length === 1 ? 'max-h-[480px]' : 'h-52'}`}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => handleVote(1)} className={`p-1.5 rounded-lg hover:bg-emerald-50 transition-colors ${post.userVote === 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className={`font-bold text-sm ${post.userVote === 1 ? 'text-emerald-600' : post.userVote === -1 ? 'text-red-500' : 'text-gray-700'}`}>
              {post.upvotes - post.downvotes}
            </span>
            <button onClick={() => handleVote(-1)} className={`p-1.5 rounded-lg hover:bg-red-50 transition-colors ${post.userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}>
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />{post.commentCount} comments
          </span>
        </div>
      </div>

      {isAuthenticated() && (
        <form onSubmit={handleComment} className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Write a comment..." className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3" />
          <div className="flex justify-end">
            <button type="submit" disabled={submitting || !comment.trim()}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          {post.commentCount} Comments
        </h2>
        {post.comments?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {post.comments.map(c => <CommentItem key={c.id} comment={c} />)}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
