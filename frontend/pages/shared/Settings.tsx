
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Key, Save, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (p: string) => {
    return p.length >= 8 && /\d/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);
  };

  // Updated handleUpdate to be asynchronous to await updatePassword result
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (pass.next !== pass.confirm) {
      setError('Password does not match');
      return;
    }

    if (!validatePassword(pass.next)) {
      setError('Minimum 8 characters, at least one digit, at least one special character required.');
      return;
    }

    const result = await updatePassword(pass.next);
    if (result.success) {
      setSuccess(true);
      setPass({ current: '', next: '', confirm: '' });
    } else {
      setError(result.message || 'Failed to update credentials');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Account Settings</h1>
      
      <div className="bg-white p-8 rounded border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-blue-700" />
          <h2 className="text-lg font-bold">Change Password</h2>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
            <input 
              type="password"
              required
              value={pass.next}
              onChange={e => setPass({ ...pass, next: e.target.value })}
              className="w-full px-4 py-2.5 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
            <input 
              type="password"
              required
              value={pass.confirm}
              onChange={e => setPass({ ...pass, confirm: e.target.value })}
              className="w-full px-4 py-2.5 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs font-bold rounded animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded text-center">
              Password updated successfully!
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-700 text-white py-3.5 rounded font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Update Credentials
          </button>
        </form>
      </div>

      <div className="bg-blue-50 p-6 rounded border border-blue-200">
        <h3 className="text-sm font-bold text-blue-900 mb-2">Password Policy</h3>
        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
          <li>Minimum 8 characters</li>
          <li>At least one numeric digit (0-9)</li>
          <li>At least one special character (!@#$%^&*)</li>
          <li>Common patterns are discouraged</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
