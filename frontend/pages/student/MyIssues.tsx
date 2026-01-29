
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, MessageCircle, ThumbsUp, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Issue } from '../../types';
import { issueAPI } from '../../services/api';

const MyIssues: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  // Fetch issues on mount and when user changes
  useEffect(() => {
    fetchIssues();
    // Auto-refresh every 10 seconds for real-time sync
    const interval = setInterval(fetchIssues, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getAll();
      
      if (response.success) {
        // Map backend data properly
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
      } else {
        setIssues([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err.message || 'Failed to fetch issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      setUpdatingId(issueId);
      await issueAPI.updateStatus(issueId, newStatus);
      
      // Update local state optimistically
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus as any } : issue
      ));
      
      setExpandedActionId(null);
      // Re-fetch to ensure data consistency
      await fetchIssues();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN': 
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'IN_PROGRESS': 
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'RESOLVED': 
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'CLOSED': 
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'CANCELLED': 
        return 'bg-red-100 text-red-700 border border-red-200';
      default: 
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': 
        return 'Open';
      case 'IN_PROGRESS': 
        return 'In Progress';
      case 'RESOLVED': 
        return 'Resolved';
      case 'CLOSED': 
        return 'Closed';
      case 'CANCELLED': 
        return 'Cancelled';
      default: 
        return status;
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
      <p className="text-slate-500 font-medium">Fetching secure records...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">{isAdmin ? 'All Student Issues' : 'Your Reported Issues'}</h1>
          <p className="text-slate-600">{isAdmin ? 'Moderate and respond to student concerns.' : 'Manage and track your active support tickets.'}</p>
        </div>
        {!isAdmin && (
          <Link to="/raise-issue" className="bg-blue-700 text-white px-6 py-2.5 rounded font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 text-center">
            New Issue
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded border border-blue-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-blue-100 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by title or ID..."
              className="w-full pl-10 pr-4 py-2 bg-blue-50 border-none rounded focus:ring-2 focus:ring-blue-700 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded text-sm font-medium hover:bg-blue-50 transition-all">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Reactions</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link to={`/issues/${issue.id}`} className="block cursor-pointer">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">#{issue.id.slice(-6)} - {issue.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{issue.createdAt}</p>
                    </Link>
                  </td>
                  {isAdmin && <td className="px-6 py-4 text-xs font-medium text-slate-700">{issue.studentName}</td>}
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">{issue.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${getStatusStyle(issue.status)}`}>
                      {getStatusLabel(issue.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <ThumbsUp size={14} />
                      <span className="text-xs font-bold">{issue.reactions}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setExpandedActionId(expandedActionId === issue.id ? null : issue.id)}
                        disabled={updatingId === issue.id}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
                      >
                        {updatingId === issue.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <MoreVertical size={18} />
                        )}
                      </button>

                      {expandedActionId === issue.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[200px]">
                          <button
                            onClick={() => handleStatusUpdate(issue.id, 'OPEN')}
                            disabled={updatingId === issue.id || issue.status === 'OPEN'}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-2 transition-all ${
                              issue.status === 'OPEN'
                                ? 'bg-blue-50 text-blue-700 cursor-default'
                                : 'hover:bg-blue-50 text-slate-700'
                            }`}
                          >
                            <AlertCircle size={16} />
                            Mark as Open
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(issue.id, 'IN_PROGRESS')}
                            disabled={updatingId === issue.id || issue.status === 'IN_PROGRESS'}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-2 border-t border-slate-100 transition-all ${
                              issue.status === 'IN_PROGRESS'
                                ? 'bg-orange-50 text-orange-700 cursor-default'
                                : 'hover:bg-orange-50 text-slate-700'
                            }`}
                          >
                            <Clock size={16} />
                            Mark as In Progress
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(issue.id, 'RESOLVED')}
                            disabled={updatingId === issue.id || issue.status === 'RESOLVED'}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-2 border-t border-slate-100 transition-all ${
                              issue.status === 'RESOLVED'
                                ? 'bg-green-50 text-green-700 cursor-default'
                                : 'hover:bg-green-50 text-slate-700'
                            }`}
                          >
                            <CheckCircle size={16} />
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {issues.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No issues found</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              There are currently no reported student issues in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssues;
