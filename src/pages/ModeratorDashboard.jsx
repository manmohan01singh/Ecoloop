import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield, Flag, Users, MessageSquare, Eye, CheckCircle,
  XCircle, Loader2, TrendingUp, AlertTriangle, FileText, Pin
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import { getPosts, getCommunities, getReports, updateReportStatus, deletePost } from '../services/communityService';
import toast from 'react-hot-toast';

const REPORT_STATUS_STYLE = {
  reported: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  verified: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-600',
};

export default function ModeratorDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!['moderator', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, p, c] = await Promise.all([
          getReports({ limit: 20 }),
          getPosts({ sort: 'new', limit: 20 }),
          getCommunities({ limit: 10 }),
        ]);
        setReports(r.data.data.items);
        setPosts(p.data.data.items);
        setCommunities(c.data.data.items);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleReportAction = async (id, status) => {
    try {
      await updateReportStatus(id, { status });
      setReports(rs => rs.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Report marked as ${status.replace('_', ' ')}`);
    } catch { toast.error('Failed to update report'); }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Remove this post?')) return;
    try {
      await deletePost(id);
      setPosts(ps => ps.filter(p => p.id !== id));
      toast.success('Post removed');
    } catch { toast.error('Failed to remove post'); }
  };

  const pendingReports = reports.filter(r => r.status === 'reported' || r.status === 'under_review');

  const TABS = [
    ['overview', 'Overview'],
    ['reports', `Reports ${pendingReports.length ? `(${pendingReports.length})` : ''}`],
    ['posts', 'Recent Posts'],
    ['communities', 'Communities'],
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name} · Keep the community healthy</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : tab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Flag, label: 'Pending Reports', value: pendingReports.length, color: 'red', link: null },
              { icon: FileText, label: 'Total Reports', value: reports.length, color: 'yellow', link: null },
              { icon: MessageSquare, label: 'Recent Posts', value: posts.length, color: 'purple', link: null },
              { icon: Users, label: 'Communities', value: communities.length, color: 'blue', link: null },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending reports preview */}
          {pendingReports.length > 0 && (
            <div className="bg-white border border-red-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Needs Attention
                </h3>
                <button onClick={() => setTab('reports')} className="text-xs text-blue-600 hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {pendingReports.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category} · {r.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${REPORT_STATUS_STYLE[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Flag, label: 'Review Reports', desc: 'Resolve community reports', onClick: () => setTab('reports'), color: 'red' },
              { icon: Eye, label: 'Monitor Posts', desc: 'Review recent community posts', onClick: () => setTab('posts'), color: 'purple' },
              { icon: Users, label: 'Communities', desc: 'Oversee community activity', onClick: () => setTab('communities'), color: 'blue' },
            ].map(q => (
              <button key={q.label} onClick={q.onClick}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all text-left">
                <div className={`w-10 h-10 bg-${q.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <q.icon className={`w-5 h-5 text-${q.color}-600`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{q.label}</p>
                <p className="text-xs text-gray-500 mt-1">{q.desc}</p>
              </button>
            ))}
          </div>
        </div>

      ) : tab === 'reports' ? (
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-center py-12 text-gray-400">No reports</p>}
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REPORT_STATUS_STYLE[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{r.category.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">{r.upvotes} upvotes</span>
                  </div>
                  <p className="font-semibold text-gray-900">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.city} · by {r.reporter?.name}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['under_review', 'verified', 'resolved', 'rejected'].map(s => (
                  <button key={s} onClick={() => handleReportAction(r.id, s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      r.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

      ) : tab === 'posts' ? (
        <div className="space-y-3">
          {posts.length === 0 && <p className="text-center py-12 text-gray-400">No posts</p>}
          {posts.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link to={`/community/post/${p.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 line-clamp-1">
                  {p.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {p.author?.name} · {p.commentCount} comments · {p.upvotes - p.downvotes} votes
                </p>
              </div>
              <button onClick={() => handleDeletePost(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 flex-shrink-0">
                <XCircle className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>

      ) : tab === 'communities' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map(c => (
            <Link key={c.id} to={`/community/${c.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                  {c.icon || '🌿'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">c/{c.name}</p>
                  <p className="text-xs text-gray-400">{c.memberCount} members</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{c.description || 'No description'}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
