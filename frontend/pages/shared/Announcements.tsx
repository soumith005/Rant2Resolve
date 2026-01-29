
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import { Announcement } from '../../types';
import { announcementAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ 
    title: '', 
    content: '', 
    category: 'INFO' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load announcements on component mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementAPI.getAll();
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
      setError(err.message || 'Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await announcementAPI.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const handleAdd = async () => {
    if (!newAnn.title || !newAnn.content) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const announcementData = {
        title: newAnn.title,
        content: newAnn.content,
        category: newAnn.category,
        publishDate: new Date().toISOString(),
      };
      
      const createdAnnouncement = await announcementAPI.create(announcementData);
      setAnnouncements(prev => [createdAnnouncement, ...prev]);
      setShowAddModal(false);
      setNewAnn({ title: '', content: '', category: 'INFO' });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'EVENT': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Announcements</h1>
          <p className="text-slate-500">Stay updated with official news from university staff.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
          >
            <Plus size={20} />
            Post New
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-slate-600 mt-4">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <Megaphone size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No announcements yet</p>
          {isAdmin && <p className="text-slate-500 text-sm mt-2">Create one using the "Post New" button</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group relative">
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete announcement"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeStyle(ann.category)}`}>
                  {ann.category}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Calendar size={14} />
                  {formatDate(ann.publishDate || ann.createdAt)}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">{ann.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">{ann.content}</p>
              <button className="text-sm font-bold text-rose-600 hover:text-rose-800 transition-colors">
                Read More
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create Announcement</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                <X className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">Title</label>
                <input 
                  type="text"
                  value={newAnn.title}
                  onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-50"
                  placeholder="Subject line"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">Category</label>
                <select 
                  value={newAnn.category}
                  onChange={e => setNewAnn({...newAnn, category: e.target.value as any})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-50"
                >
                  <option value="INFO">Information</option>
                  <option value="URGENT">Urgent Alert</option>
                  <option value="EVENT">Upcoming Event</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">Content</label>
                <textarea 
                  rows={4}
                  value={newAnn.content}
                  onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 resize-none disabled:bg-slate-50"
                  placeholder="Announcement details..."
                />
              </div>
              <button 
                onClick={handleAdd}
                disabled={isSubmitting}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-all mt-4 shadow-lg shadow-rose-100 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'PUBLISH ANNOUNCEMENT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
