
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { IssueCategory } from '../../types';
import { api } from '../../services/api';

const RaiseIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'MEDICAL' as IssueCategory,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/issues', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });
      navigate('/my-issues');
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span>Issues</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">New Issue</span>
      </div>

      <div className="bg-white rounded border border-blue-200 shadow-xl overflow-hidden">
        <div className="bg-blue-700 p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Raise a New Issue</h1>
          <p className="text-blue-100 opacity-90">Clearly state your concern for the administration to review.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <p className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Issue Title</label>
              <input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Lack of charging ports in library"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as IssueCategory})}
                className="w-full px-4 py-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none transition-all"
              >
                <option value="MEDICAL">🔴 Medical</option>
                <option value="ACADEMIC">Academic</option>
                <option value="HOSTEL">Hostel</option>
                <option value="FINANCE">Finance</option>
                <option value="TECHNICAL">Technical</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
            <textarea 
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Please provide specific details..."
              className="w-full px-4 py-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none transition-all resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
              Your report will be stored in our central database for official review.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-700 text-white py-4 rounded font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={18} /> SUBMIT OFFICIAL REPORT</>}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded font-bold text-slate-600 hover:bg-blue-50 transition-all">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIssue;
