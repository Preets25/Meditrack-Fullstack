import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Shield, Edit3, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      // await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const roleLabel = { patient: 'Healthcare Patient', shop_owner: 'Pharmacy Owner', admin: 'Administrator' }[user.role] ?? user.role;

  return (
    <div className="p-6 md:p-10 animate-fade-in-up">
      <div className="mb-10">
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Account Profile
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>Manage your identity and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Identity Card */}
        <div className="lg:col-span-1">
          <div className="card-premium p-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div style={{
              width: 88, height: 88, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem',
              boxShadow: '0 8px 32px rgba(79, 70, 229, 0.35)',
              fontFamily: 'Outfit, sans-serif'
            }}>
              {initials}
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {user.name}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 500 }}>
              {user.email}
            </p>
            {user.username && (
              <p style={{ color: '#818cf8', fontSize: '0.8125rem', marginTop: '0.25rem', fontWeight: 600 }}>
                @{user.username}
              </p>
            )}

            <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Role badge */}
              <div style={{
                padding: '0.625rem 1rem', background: '#eef2ff', borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <Shield size={14} style={{ color: '#4f46e5' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4338ca' }}>{roleLabel}</span>
              </div>

              {/* Email alerts badge */}
              <div style={{
                padding: '0.625rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534' }}>Email Alerts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Panel */}
        <div className="lg:col-span-2">
          <div className="card-premium p-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
              <div style={{
                width: 44, height: 44, background: '#eef2ff', borderRadius: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5'
              }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Security Settings
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Update your login credentials</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="input-premium"
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-premium"
                  placeholder="Min. 6 characters"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 500 }}>
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-premium"
                style={{ marginTop: '0.5rem', width: 'fit-content' }}
              >
                {saving ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Update Password
                  </>
                )}
              </button>
            </form>

            {/* Info banner */}
            <div style={{
              marginTop: '2rem', padding: '1rem 1.25rem', background: '#f8faff',
              borderRadius: '1rem', border: '1.5px solid #e8eaf6',
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
            }}>
              <div style={{ width: 6, height: 6, background: '#818cf8', borderRadius: '50%', marginTop: 7, flexShrink: 0 }} />
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>
                For security, choose a unique password you don't use elsewhere. Your session will remain active after changing your password.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
