import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Opportunity } from '../../types';
import { opportunityAPI } from '../../services/api';

const OpportunitiesManagement: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'INTERNSHIP' as const,
    location: '',
    mode: 'Remote' as const,
    stipend: '',
    description: '',
    skills: '',
    eligibility: '',
    duration: '',
    deadline: '',
    applyUrl: '',
    isInternal: true,
  });

  // Load opportunities
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityAPI.getAll();
      setOpportunities(data);
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
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const opportunityData = {
        ...formData,
        skills: skillsArray,
      };

      if (editingId) {
        await opportunityAPI.update(editingId, opportunityData);
      } else {
        await opportunityAPI.create(opportunityData);
      }

      loadOpportunities();
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await opportunityAPI.delete(id);
      // Remove from state immediately instead of reloading
      setOpportunities(opportunities.filter(opp => opp.id !== id && opp._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setFormData({
      title: opportunity.title,
      company: opportunity.company,
      type: opportunity.type,
      location: opportunity.location,
      mode: opportunity.mode,
      stipend: opportunity.stipend || '',
      description: opportunity.description,
      skills: opportunity.skills.join(', '),
      eligibility: opportunity.eligibility,
      duration: opportunity.duration,
      deadline: new Date(opportunity.deadline).toISOString().split('T')[0],
      applyUrl: opportunity.applyUrl || '',
      isInternal: opportunity.isInternal,
    });
    setEditingId(opportunity.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      type: 'INTERNSHIP',
      location: '',
      mode: 'Remote',
      stipend: '',
      description: '',
      skills: '',
      eligibility: '',
      duration: '',
      deadline: '',
      applyUrl: '',
      isInternal: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Opportunities Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and manage opportunities</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} /> Add Opportunity
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
            {editingId ? 'Edit Opportunity' : 'New Opportunity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Company / Department"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL-TIME">Full-Time</option>
                <option value="RESEARCH">Research</option>
              </select>
              <select
                value={formData.mode}
                onChange={e => setFormData({ ...formData, mode: e.target.value as any })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Remote">Remote</option>
                <option value="On-Campus">On-Campus</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Stipend (e.g., $1500/mo)"
                value={formData.stipend}
                onChange={e => setFormData({ ...formData, stipend: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 6 months)"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                placeholder="Deadline"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <textarea
              placeholder="Full Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="text"
              placeholder="Required Skills (comma-separated)"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              placeholder="Eligibility Criteria"
              value={formData.eligibility}
              onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
              required
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isInternal}
                  onChange={e => setFormData({ ...formData, isInternal: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-700">Internal Application</span>
              </label>
            </div>

            {!formData.isInternal && (
              <input
                type="url"
                placeholder="External Application URL"
                value={formData.applyUrl}
                onChange={e => setFormData({ ...formData, applyUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                {editingId ? 'Update' : 'Create'} Opportunity
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
          <p className="text-slate-600 mt-4">Loading opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600">No opportunities yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {opportunities.map(opp => (
            <div key={opp.id} className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{opp.title}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                      {opp.type}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2">{opp.company} • {opp.location} • {opp.mode}</p>
                  <p className="text-slate-600 text-sm">{opp.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-slate-500">
                    <span>Skills: {opp.skills.join(', ')}</span>
                    <span>Duration: {opp.duration}</span>
                    {opp.stipend && <span>Stipend: {opp.stipend}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(opp)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(opp.id)}
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

export default OpportunitiesManagement;
