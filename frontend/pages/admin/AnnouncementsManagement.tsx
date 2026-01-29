import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Bell, Info, AlertTriangle } from 'lucide-react';
import { Announcement } from '../../types';
import { announcementAPI } from '../../services/api';

const AnnouncementsManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'INFO' as const,
    publishDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementAPI.getAll();
      setAnnouncements(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await announcementAPI.update(editingId, formData);
      } else {
        await announcementAPI.create(formData);
      }
      loadAnnouncements();
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      loadAnnouncements();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      publishDate: new Date(announcement.publishDate).toISOString().split('T')[0],
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'INFO',
      publishDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'URGENT':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'EVENT':
        return <Bell size={20} className="text-blue-500" />;
      default:
        return <Info size={20} className="text-slate-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const baseClass = 'px-3 py-1 text-xs font-medium rounded-full';
    switch (category) {
      case 'URGENT':
        return `${baseClass} bg-red-100 text-red-700`;
      case 'EVENT':
        return `${baseClass} bg-blue-100 text-blue-700`;
      default:
        return `${baseClass} bg-slate-100 text-slate-700`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcements Management</h1>
          <p className="text-slate-600 mt-1">Create and manage university announcements</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} /> Post Announcement
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-slate-900">
            {editingId ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INFO">Information</option>
                <option value="EVENT">Event</option>
                <option value="URGENT">Urgent</option>
              </select>
              <input
                type="date"
                value={formData.publishDate}
                onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <textarea
              placeholder="Announcement Content"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                {editingId ? 'Update' : 'Post'} Announcement
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 mt-4">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Bell size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-600">No announcements yet. Post one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map(announcement => (
            <div
              key={announcement.id}
              className={`p-6 bg-white border-l-4 rounded-lg hover:shadow-md transition ${
                announcement.category === 'URGENT'
                  ? 'border-l-red-500'
                  : announcement.category === 'EVENT'
                  ? 'border-l-blue-500'
                  : 'border-l-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(announcement.category)}
                    <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                    <span className={getCategoryBadge(announcement.category)}>
                      {announcement.category}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">{announcement.content}</p>
                  <p className="text-sm text-slate-500">
                    Published: {new Date(announcement.publishDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;
