import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../services/api';

interface ApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  opportunityId,
  opportunityTitle,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    statementOfInterest: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const applicationData = {
        opportunityId,
        opportunityTitle,
        resumePath: resumeFile ? resumeFile.name : null,
        statementOfInterest: formData.statementOfInterest,
      };

      await applicationAPI.apply(opportunityId, applicationData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Apply for {opportunityTitle}</h2>
            <p className="text-slate-600 mt-1">Complete your application below</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Auto-filled fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Student ID</label>
              <input
                type="text"
                value={user?.id || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
              />
            </div>
          </div>

          {/* Resume upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resume (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition cursor-pointer"
              onClick={() => document.getElementById('resume-input')?.click()}
            >
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-700 font-medium">{resumeFile ? resumeFile.name : 'Click to upload resume'}</p>
              <p className="text-sm text-slate-500 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files) {
                    setResumeFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Statement of interest */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Statement of Interest *
            </label>
            <textarea
              value={formData.statementOfInterest}
              onChange={(e) => setFormData({ ...formData, statementOfInterest: e.target.value })}
              required
              placeholder="Tell us why you're interested in this opportunity and what makes you a great fit..."
              rows={5}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 50 characters recommended</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
