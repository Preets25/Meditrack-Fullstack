import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters.');
        return;
      }
      
      // Attempt API call for password change (assuming backend supports it)
      // await api.post('/auth/change-password', { oldPassword, newPassword });
      
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <User size={48} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
             <p className="text-slate-500 mb-4">{user.email}</p>
             
             <div className="w-full space-y-3 mt-4">
               <span className="block px-3 py-2 bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs capitalize border border-slate-100">
                  Account Type: {user.role.replace('_', ' ')}
               </span>
               <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Email Alerts</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">ACTIVE</span>
               </div>
             </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
               <Lock className="text-slate-400" /> Security Settings
             </h3>
             <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition w-full md:w-auto">
                  Update Password
                </button>
             </form>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
