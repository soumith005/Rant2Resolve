import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Send,
  Trash2,
  XCircle,
  ThumbsUp,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { IssueStatus, Issue } from '../../types';
import { issueAPI } from '../../services/api';

const IssueDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getById(id!);
      if (response.success) {
        setIssue({
          id: response.data._id || response.data.id,
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          status: response.data.status || 'OPEN',
          studentId: response.data.studentId,
          studentName: response.data.studentName,
          reactions: response.data.reactions || 0,
          replies: (response.data.replies || []).map((r: any) => ({
            id: r._id || r.id,
            userId: r.userId,
            userName: r.userName,
            userRole: r.userRole,
            content: r.content,
            timestamp: new Date(r.timestamp).toLocaleString()
          })),
          createdAt: new Date(response.data.createdAt).toLocaleString(),
          updatedAt: response.data.updatedAt
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch issue:', err);
      setError(err.message || 'Failed to load issue');
      navigate('/my-issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIssue();
      // Auto-refresh every 3 seconds for real-time status updates from admins
      const interval = setInterval(fetchIssue, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !issue || !user) return;
    try {
      await issueAPI.addReply(id!, replyText);
      setReplyText('');
      fetchIssue();
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    }
  };

  const handleUpdateStatus = async (newStatus: IssueStatus) => {
    if (!issue) return;
    try {
      const response = await issueAPI.updateStatus(id!, newStatus);
      if (response.success) {
        setIssue(prev => prev ? { ...prev, status: newStatus } : null);
        // Re-fetch to ensure data is fresh
        fetchIssue();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
      <p className="text-slate-500 font-medium">Loading conversation...</p>
    </div>
  );

  if (!issue) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': 
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'IN_PROGRESS': 
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'RESOLVED': 
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CLOSED':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'CANCELLED': 
        return 'text-red-600 bg-red-50 border-red-200';
      default: 
        return 'text-slate-600 bg-slate-50 border-slate-100';
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium">
          <ArrowLeft size={18} />
          Back to List
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Issue #{issue.id.slice(-6)}</span>
                <h1 className="text-3xl font-extrabold text-slate-800 mt-2">{issue.title}</h1>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><User size={14} />{issue.studentName}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />{issue.createdAt}</span>
                  <span className="flex items-center gap-1.5 text-rose-500 font-bold"><ThumbsUp size={14} />{issue.reactions} Reactions</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-tight ${getStatusColor(issue.status)}`}>
                {getStatusLabel(issue.status)}
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <MessageSquare size={20} className="text-rose-600" />
              <h2 className="text-lg font-bold text-slate-800">Threaded Conversation</h2>
            </div>
            
            <div className="p-6 space-y-6 bg-slate-50/50 min-h-[200px]">
              {issue.replies && issue.replies.length > 0 ? (
                issue.replies.map((reply) => (
                  <div key={reply.id} className={`flex gap-4 ${reply.userRole === 'ADMIN' ? 'bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100' : ''}`}>
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold border ${reply.userRole === 'ADMIN' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {reply.userName?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{reply.userName}</span>
                          {reply.userRole === 'ADMIN' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white uppercase tracking-widest shadow-sm">Admin Response</span>}
                        </div>
                        <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>No replies yet. Be the first to respond!</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <textarea 
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={isAdmin ? "Type your official Admin Response..." : "Type your query or follow-up..."}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none text-sm"
                rows={3}
              />
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-rose-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-rose-100 transition-all"
                >
                  <Send size={16} />
                  {isAdmin ? 'SUBMIT ADMIN RESPONSE' : 'POST UPDATE'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Status Control</h3>
              <div className="grid grid-cols-1 gap-2">
                {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as IssueStatus[]).map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleUpdateStatus(s as IssueStatus)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold text-left transition-all ${
                      issue.status === s ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Meta Data</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Category</span>
                <span className="font-bold text-slate-800">{issue.category}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <span className={`font-bold ${
                  issue.status === 'RESOLVED' ? 'text-green-600' : 
                  issue.status === 'IN_PROGRESS' ? 'text-amber-600' :
                  issue.status === 'OPEN' ? 'text-blue-600' : 'text-slate-600'
                }`}>
                  {getStatusLabel(issue.status)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Reactions</span>
                <span className="font-bold text-rose-600">{issue.reactions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
