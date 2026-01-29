
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Trash2, Mail, Shield, User as UserIcon, X, Plus } from 'lucide-react';
import { UserRole } from '../../types';

const UserManagement: React.FC = () => {
  const { users, createUser, deleteUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' as UserRole, department: '' });
  const [error, setError] = useState('');

  const validatePassword = (p: string) => {
    return p.length >= 8 && /\d/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);
  };

  // Updated handleCreate to be asynchronous to await createUser result
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(formData.password)) {
      setError('Password must be 8+ chars, with digit and special char.');
      return;
    }

    const result = await createUser(formData);
    if (result.success) {
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'STUDENT', department: '' });
    } else {
      setError(result.message || 'Failed to create user');
    }
  };

  // Wrapper to handle async deletion
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await deleteUser(id);
      if (!result.success) {
        alert(result.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Create and manage accounts for students and staff.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2"
        >
          <Plus size={20}/>
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt={u.name} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.department}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => u.role !== 'ADMIN' && handleDelete(u.id)}
                    className={`p-2 text-slate-300 hover:text-red-600 transition-colors ${u.role === 'ADMIN' ? 'opacity-0 cursor-default' : ''}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create New Account</h2>
              <button onClick={() => setShowModal(false)}><X className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none">
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin Staff</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Initial Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" placeholder="Min 8 chars, 1 digit, 1 special" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" placeholder="e.g. Computer Science" />
              </div>

              {error && <p className="text-red-600 text-xs font-bold animate-pulse">{error}</p>}

              <button type="submit" className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 mt-4">
                <UserPlus size={18}/>
                CREATE USER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
