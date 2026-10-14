import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Shield, Flag, Users, MessageSquare, Eye, CheckCircle,
  XCircle, Loader2, AlertTriangle, FileText, Pin, Search,
  Filter, Clock, TrendingUp, UserX, Ban, AlertCircle, Info, FileCheck2
} from 'lucide-react';
import useAuthStore from '../context/authStore';
import ApplicationQueueTab from '../components/admin/ApplicationQueueTab';
import {
  getModeratorDashboard,
  getAllPostsForModeration,
  getAllCommentsForModeration,
  moderatePost,
  moderateComment,
  getReportsForModerator,
  handleReport,
  getUserProfileForMod,
  issueWarning,
  suspendUser,
  getCommunitiesForMod,
  searchUsers
} from '../services/moderatorService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  reported: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-700 border-blue-200',
  verified: 'bg-purple-100 text-purple-700 border-purple-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function ModeratorDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({});
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (tab !== 'overview') {
      loadTabData();
    }
  }, [tab, searchTerm, statusFilter, categoryFilter]);

  // Check permissions
  if (!['moderator', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getModeratorDashboard();
      setStats(response.data.data.stats);
    } catch (error) {
      // Silently handle error - set empty stats
      console.log('Dashboard data not available yet');
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    try {
      const params = { search: searchTerm, status: statusFilter, category: categoryFilter };
      
      if (tab === 'posts') {
        const response = await getAllPostsForModeration(params);
        setPosts(response.data.data.items);
      } else if (tab === 'comments') {
        const response = await getAllCommentsForModeration(params);
        setComments(response.data.data.items);
      } else if (tab === 'reports') {
        const response = await getReportsForModerator(params);
        setReports(response.data.data.items);
      } else if (tab === 'users') {
        const response = await searchUsers(params);
        setUsers(response.data.data.items);
      } else if (tab === 'communities') {
        const response = await getCommunitiesForMod(params);
        setCommunities(response.data.data.items);
      }
    } catch (error) {
      // Silently handle error - set empty data
      console.log(`${tab} data not available yet`);
      if (tab === 'posts') setPosts([]);
      else if (tab === 'comments') setComments([]);
      else if (tab === 'reports') setReports([]);
      else if (tab === 'users') setUsers([]);
      else if (tab === 'communities') setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostModeration = async (postId, action, reason = '') => {
    try {
      await moderatePost(postId, { action, reason });
      toast.success(`Post ${action}d successfully`);
      loadTabData();
    } catch (error) {
      toast.error(`Failed to ${action} post`);
    }
  };

  const handleCommentModeration = async (commentId, action, reason = '') => {
    try {
      await moderateComment(commentId, { action, reason });
      toast.success(`Comment ${action}d successfully`);
      loadTabData();
    } catch (error) {
      toast.error(`Failed to ${action} comment`);
    }
  };

  const handleReportAction = async (reportId, action, adminNote = '') => {
    try {
      await handleReport(reportId, { action, adminNote });
      toast.success('Report handled successfully');
      loadTabData();
    } catch (error) {
      toast.error('Failed to handle report');
    }
  };

  const handleIssueWarning = async (userId, severity, reason) => {
    try {
      await issueWarning(userId, { severity, reason });
      toast.success('Warning issued successfully');
    } catch (error) {
      toast.error('Failed to issue warning');
    }
  };

  const handleSuspendUser = async (userId, days, reason) => {
    try {
      await suspendUser(userId, { days, reason });
      toast.success(`User suspended for ${days} days`);
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Dashboard', icon: Shield },
    { id: 'reports', label: `Reports ${stats.pendingReports ? `(${stats.pendingReports})` : ''}`, icon: Flag },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'applications', label: 'Role Applications', icon: FileCheck2 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.name} · Keep the community safe</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Moderator</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === 'overview' && <OverviewTab stats={stats} onTabChange={setTab} />}

          {/* Reports Tab */}
          {tab === 'reports' && (
            <ReportsTab
              reports={reports}
              onAction={handleReportAction}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}

          {/* Posts Tab */}
          {tab === 'posts' && (
            <PostsTab
              posts={posts}
              onModerate={handlePostModeration}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}

          {/* Comments Tab */}
          {tab === 'comments' && (
            <CommentsTab
              comments={comments}
              onModerate={handleCommentModeration}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <UsersTab
              users={users}
              onWarn={handleIssueWarning}
              onSuspend={handleSuspendUser}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {/* Communities Tab */}
          {tab === 'communities' && (
            <CommunitiesTab
              communities={communities}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {/* Role Applications Queue Tab */}
          {tab === 'applications' && (
            <ApplicationQueueTab />
          )}
        </>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, onTabChange }) {
  const statCards = [
    { icon: Flag, label: 'Total Reports', value: stats.totalReports || 0, color: 'yellow', action: () => onTabChange('reports') },
    { icon: AlertTriangle, label: 'Pending Reports', value: stats.pendingReports || 0, color: 'red', action: () => onTabChange('reports') },
    { icon: CheckCircle, label: 'Resolved Reports', value: stats.resolvedReports || 0, color: 'green' },
    { icon: FileText, label: 'Total Posts', value: stats.totalPosts || 0, color: 'blue', action: () => onTabChange('posts') },
    { icon: XCircle, label: 'Flagged Posts', value: stats.flaggedPosts || 0, color: 'orange', action: () => onTabChange('posts') },
    { icon: MessageSquare, label: 'Total Comments', value: stats.totalComments || 0, color: 'purple', action: () => onTabChange('comments') },
    { icon: UserX, label: 'Suspended Users', value: stats.suspendedUsers || 0, color: 'red' },
    { icon: TrendingUp, label: 'Activity Today', value: '..', color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isClickable = !!stat.action;
          const Component = isClickable ? 'button' : 'div';
          
          return (
            <Component
              key={stat.label}
              onClick={stat.action}
              className={`bg-white border border-gray-200 rounded-xl p-5 ${isClickable ? 'hover:border-blue-300 hover:shadow-md cursor-pointer transition-all' : ''}`}
            >
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Component>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Moderator Guidelines
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Review reported content within 24 hours</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Always provide reason for moderation actions</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Issue warnings before suspensions</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Escalate serious violations to Admin</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Document all moderation decisions</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Be fair, consistent, and transparent</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ reports, onAction, searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="reported">Reported</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_COLORS[report.status]}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{report.category?.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">{report.upvotes} upvotes</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-400">
                    {report.city} · by {report.reporter?.name} · {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.adminNote && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
                      <strong>Admin Note:</strong> {report.adminNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onAction(report.id, 'under_review', '')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Under Review
                </button>
                <button
                  onClick={() => onAction(report.id, 'verified', '')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    const note = prompt('Resolution note:');
                    if (note) onAction(report.id, 'resolved', note);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => {
                    const note = prompt('Rejection reason:');
                    if (note) onAction(report.id, 'rejected', note);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Posts Tab Component  
function PostsTab({ posts, onModerate, searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Posts</option>
          <option value="active">Active</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className={`bg-white border rounded-xl p-5 ${post.isRemoved ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {post.isRemoved && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded mb-2">
                      Removed
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.body}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>by {post.author?.name}</span>
                    <span>•</span>
                    <span>c/{post.community?.name || 'general'}</span>
                    <span>•</span>
                    <span>{post.commentCount} comments</span>
                    <span>•</span>
                    <span>{post.upvotes - post.downvotes} votes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {!post.isRemoved ? (
                  <>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for removal:');
                        if (reason) onModerate(post.id, 'remove', reason);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for hiding:');
                        if (reason) onModerate(post.id, 'hide', reason);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Hide
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onModerate(post.id, 'approve', '')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Restore
                  </button>
                )}
                <a
                  href={`/community/post/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Comments Tab Component
function CommentsTab({ comments, onModerate, searchTerm, setSearchTerm }) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search comments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No comments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className={`bg-white border rounded-xl p-4 ${comment.isRemoved ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {comment.isRemoved && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded mb-2">
                      Removed
                    </span>
                  )}
                  <p className="text-sm text-gray-900 mb-2">{comment.body}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>by {comment.author?.name}</span>
                    <span>•</span>
                    <span>on post: {comment.post?.title?.slice(0, 50)}...</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!comment.isRemoved ? (
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for removal:');
                      if (reason) onModerate(comment.id, 'remove', reason);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => onModerate(comment.id, 'approve', '')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, onWarn, onSuspend, searchTerm, setSearchTerm }) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((usr) => (
            <div key={usr.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{usr.name}</p>
                    <p className="text-sm text-gray-500">{usr.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{usr.role}</span>
                      <span className="text-xs text-gray-400">{usr.ecoKarmaTotal} karma</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const reason = prompt('Warning reason:');
                      if (reason) onWarn(usr.id, 'medium', reason);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => {
                      const days = prompt('Suspension days:');
                      const reason = prompt('Suspension reason:');
                      if (days && reason) onSuspend(usr.id, parseInt(days), reason);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Communities Tab Component
function CommunitiesTab({ communities, searchTerm, setSearchTerm }) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Communities Grid */}
      {communities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No communities found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <div key={community.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                  {community.icon || '🌿'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">c/{community.name}</p>
                  <p className="text-xs text-gray-400">{community.memberCount} members</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{community.description || 'No description'}</p>
              <a
                href={`/community/${community.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View Community →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
