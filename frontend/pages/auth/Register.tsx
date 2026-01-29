
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, ArrowRight, Eye, EyeOff, ShieldCheck, GraduationCap } from 'lucide-react';
import { UserRole } from '../../types';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as UserRole,
    department: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasDigit = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return minLength && hasDigit && hasSpecial;
  };

  // Updated to async/await to handle the Promise returned by register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 chars, with one digit and one special char.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password does not match');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl -ml-48 -mt-48 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl -mr-48 -mb-48 opacity-50"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded shadow-2xl overflow-hidden z-10 relative">
        <div className="bg-blue-700 p-12 text-white hidden md:flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-blue-700 font-bold text-2xl mb-8 shadow-xl">R</div>
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">Join Rant2Resolve</h1>
            <p className="text-blue-100 text-lg opacity-90 leading-relaxed">Create your account to start reporting issues and collaborating with university management.</p>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-3 p-4 bg-white/10 rounded">
                <ShieldCheck size={24}/>
                <div>
                    <p className="font-bold">Secure Access</p>
                    <p className="text-xs text-blue-100">Your data is stored securely and handled with transparency.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Create Account</h2>
            <p className="text-slate-600">Join our transparent university ecosystem</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="john@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Department</label>
                <input 
                  type="text" 
                  required 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. Science"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg text-center animate-pulse">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-100 mt-4"
            >
              CREATE MY ACCOUNT
              <UserPlus size={18} />
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-sm text-slate-500">
               Already have an account? <Link to="/login" className="text-rose-600 font-bold hover:underline">Login here</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
