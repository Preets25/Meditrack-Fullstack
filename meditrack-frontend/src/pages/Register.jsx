import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getPostLoginPath } from '../lib/authRedirect';
import { Pill, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      navigate(getPostLoginPath(user?.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6 font-sans">
      <div className="max-w-md w-full glass rounded-[2.5rem] p-10 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-pink-500 to-blue-500 opacity-50"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-100 mb-6 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
            <Pill className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Create Identity</h1>
          <p className="text-slate-500 mt-2 font-medium">Begin your professional health journey</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-sm text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" required className="input-premium" placeholder="e.g. Dr. Aryan Khan"
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input type="text" required className="input-premium" placeholder="unique_identifier"
              onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input type="email" required className="input-premium" placeholder="name@medical.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-premium !pr-12"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Role</label>
            <select className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 cursor-pointer text-slate-700 font-medium"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="patient">Patient (Healthcare Consumer)</option>
              <option value="shop_owner">Shop Owner (Pharmacy Provider)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium w-full mt-6 py-4 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </>
            ) : 'Establish Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100/50 text-center">
            <p className="text-sm text-slate-500">
                Already part of Meditrack? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;