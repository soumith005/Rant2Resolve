
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, ArrowRight, Lock, UserCircle, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Updated to async/await to handle the Promise returned by login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    
    if (result.success) {
      if (result.user?.role !== 'ADMIN') {
        setError('Invalid Admin Credentials');
        return;
      }
      navigate('/');
    } else {
      setError('Invalid Admin Credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-rose-900/50">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 mt-2 font-medium italic">Rant2Resolve Management System</p>
        </div>

        <div className="bg-white rounded-[2rem] p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <Lock className="text-rose-600" size={20} />
            <span className="font-bold text-slate-800 uppercase tracking-widest text-xs">Secure Authorization</span>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin ID / Email</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rant2resolve.edu"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                <p className="text-red-600 text-xs font-bold text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
            >
              AUTHORIZE ACCESS
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold text-rose-600 hover:text-rose-700 underline underline-offset-4">
              Switch to Student Login
            </Link>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8">
          This system is restricted to authorized university personnel only. All access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
