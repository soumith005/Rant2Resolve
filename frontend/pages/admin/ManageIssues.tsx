import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { io } from 'socket.io-client';
import { Issue, IssueStatus } from '../../types';
import { issueAPI } from '../../services/api';

const ManageIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusOptions: IssueStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
  const categoryOptions = ['MEDICAL', 'ACADEMIC', 'HOSTEL', 'FINANCE', 'TECHNICAL', 'OTHERS'];
  
  // Priority order for automatic sorting
  const priorityMap: { [key: string]: number } = {
    'MEDICAL': 1,
    'ACADEMIC': 2,
    'FINANCE': 3,
    'TECHNICAL': 4,
    'HOSTEL': 5,
    'OTHERS': 6
  };

  useEffect(() => {
    loadIssues();
    // Auto-refresh every 5 seconds for real-time sync
    const interval = setInterval(loadIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getAll();
      
      if (response.success) {
        const formatted = response.data.map((i: any) => ({
          id: i._id || i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          status: i.status || 'OPEN',
          studentId: i.studentId,
          studentName: i.studentName,
          reactions: i.reactions || 0,
          replies: i.replies || [],
          createdAt: new Date(i.createdAt).toLocaleString(),
          updatedAt: i.updatedAt
        }));
        setIssues(formatted);
      }
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      setUpdatingId(issueId);
      const response = await issueAPI.updateStatus(issueId, newStatus);
      
      // Update local state optimistically
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
      
      // Emit real-time event to other users
      try {
        const socket = io('http://localhost:5000', { reconnection: false });
        socket.emit('issue_status_updated', {
          issueId,
          status: newStatus,
          timestamp: new Date().toISOString()
        });
        socket.disconnect();
      } catch (e) {
        console.log('Socket event emission skipped (optional feature)');
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      // Reload to get correct state if update failed
      loadIssues();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle size={16} />;
      case 'IN_PROGRESS':
        return <Clock size={16} />;
      case 'RESOLVED':
        return <CheckCircle size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MEDICAL: 'bg-red-100 text-red-700 border-red-300 font-semibold',
      ACADEMIC: 'bg-blue-50 text-blue-700 border-blue-200',
      HOSTEL: 'bg-purple-50 text-purple-700 border-purple-200',
      FINANCE: 'bg-green-50 text-green-700 border-green-200',
      TECHNICAL: 'bg-orange-50 text-orange-700 border-orange-200',
      OTHERS: 'bg-slate-50 text-slate-700 border-slate-200'
    };
    return colors[category] || colors.OTHERS;
  };

  // Filter and search
  const filteredIssues = issues.filter(issue => {
    const matchSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    const matchCategory = filterCategory === 'ALL' || issue.category === filterCategory;
    
    return matchSearch && matchStatus && matchCategory;
  }).sort((a, b) => {
    // First sort by priority (Medical first)
    const priorityDiff = (priorityMap[a.category] || 99) - (priorityMap[b.category] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by creation date (most recent first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getStatusStats = () => {
    return {
      open: issues.filter(i => i.status === 'OPEN').length,
      inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
      resolved: issues.filter(i => i.status === 'RESOLVED').length,
      total: issues.length
    };
  };

  const stats = getStatusStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Issues</h1>
        <p className="text-slate-600 mt-1">Manage and track student issues across the institution</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <p className="text-slate-600 text-sm font-medium">Total Issues</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 bg-white border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Open</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.open}</p>
        </div>
        <div className="p-4 bg-white border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="p-4 bg-white border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">Resolved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by issue title or student name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as IssueStatus | 'ALL')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 mt-4">Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-600">No issues found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{issue.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        by {issue.studentName} • {issue.createdAt}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-3 line-clamp-2">{issue.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(issue.category)}`}>
                      {issue.category === 'MEDICAL' && '🔴'}
                      {issue.category}
                      {issue.category === 'MEDICAL' && <span className="text-xs ml-1">(High Priority)</span>}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                      {issue.replies?.length || 0} replies
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex-shrink-0 w-full md:w-48">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Update Status</label>
                  <div className="relative">
                    <select
                      value={issue.status}
                      onChange={e => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                      disabled={updatingId === issue.id}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium appearance-none cursor-pointer transition ${
                        getStatusColor(issue.status)
                      } ${updatingId === issue.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status === 'IN_PROGRESS' ? 'In Progress' : status}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                      {updatingId === issue.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageIssues;
