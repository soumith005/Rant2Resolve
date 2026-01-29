
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, ArrowRight, ShieldAlert, Stethoscope, Info, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Updated to async/await to handle the Promise returned by login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      if (result.user?.role !== 'STUDENT') {
        setError('Please use the Admin Login portal for staff accounts.');
        return;
      }
      navigate('/');
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl -mr-48 -mt-48 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl -ml-48 -mb-48 opacity-50"></div>

      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-center z-10">
        <div className="bg-white px-6 py-3 rounded shadow-sm border border-blue-200 flex items-center gap-3">
          <ShieldAlert className="text-blue-700" size={20} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency: Security</p>
            <p className="text-sm font-bold text-blue-900">+1-900-555-GUARD</p>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded shadow-sm border border-blue-200 flex items-center gap-3">
          <Stethoscope className="text-blue-700" size={20} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency: Ambulance</p>
            <p className="text-sm font-bold text-blue-900">+1-900-555-AMBU</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded shadow-2xl overflow-hidden z-10 relative">
        <div className="bg-blue-700 p-12 text-white hidden md:flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-blue-700 font-bold text-2xl mb-8 shadow-xl">R</div>
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">Rant2Resolve</h1>
            <p className="text-blue-100 text-lg opacity-90 leading-relaxed">Student Portal: Voice your concerns directly to university management.</p>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-3 p-4 bg-white/10 rounded">
                <Info size={20}/>
                <p className="text-xs">Staff member? Use the <Link to="/admin/login" className="font-bold underline">Admin Portal</Link> instead.</p>
             </div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <GraduationCap className="text-blue-700" size={24} />
              <h2 className="text-3xl font-bold text-blue-900">Student Login</h2>
            </div>
            <p className="text-slate-600">Access your resolution dashboard</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Student Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="id@university.edu"
                className="w-full px-4 py-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-blue-700 hover:underline transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-700 outline-none transition-all pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg text-center animate-pulse">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-700 text-white py-4 rounded font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              ENTER STUDENT PORTAL
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-4">
             <p className="text-sm text-slate-600">
               Don't have an account? <Link to="/register" className="text-blue-700 font-bold hover:underline">Sign up now</Link>
             </p>
             <div className="pt-4 border-t border-blue-100">
               <Link to="/admin/login" className="text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors">
                 Are you an Administrator? Click here.
               </Link>
             </div>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2 text-blue-900">Student Account Recovery</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              For security, please visit the IT Helpdesk or contact a System Administrator to reset your password.
            </p>
            <button onClick={() => setShowForgotModal(false)} className="w-full bg-blue-700 text-white py-3 rounded font-bold hover:bg-blue-800 transition-all">
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
