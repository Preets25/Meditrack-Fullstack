import React, { useState, useEffect } from 'react';
import { Users, Store, Pill, TrendingUp, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState({
    stats: { patients: 0, shopOwners: 0, shops: 0, activeMeds: 0 },
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading platform metrics...</div>;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Patients" val={data.stats.patients} icon={<Users className="text-emerald-600" />} />
        <StatCard title="Registered Shops" val={data.stats.shops} icon={<Store className="text-blue-600" />} />
        <StatCard title="Total Shop Owners" val={data.stats.shopOwners} icon={<TrendingUp className="text-indigo-600" />} />
        <StatCard title="Active Medications Tracked" val={data.stats.activeMeds} icon={<Pill className="text-amber-600" />} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map(user => (
                <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'shop_owner' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, val, icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition cursor-default">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{val}</p>
    </div>
  </div>
);

export default AdminDashboard;
