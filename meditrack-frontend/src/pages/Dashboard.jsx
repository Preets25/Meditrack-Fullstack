import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, due: 0, lowStock: 0, minDays: 0 });
  const [schedule, setSchedule] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, scheduleRes, logsRes] = await Promise.all([
        api.get('/medicines/stats'),
        api.get('/medicines/today'),
        api.get('/doses/history')
      ]);
      setStats(statsRes.data);
      setSchedule(scheduleRes.data);
      setChartData(logsRes.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  const handleAction = async (id, action) => {
    try {
      // 1. Optimistic UI: Remove from schedule list locally
      setSchedule(prev => prev.filter(item => item._id !== id));
      
      // 2. Optimistic UI: Update the Adherence Graph immediately
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = days[new Date().getDay()];
      
      setChartData(prev => prev.map(item => {
        if (item.day === currentDay) {
          return {
            ...item,
            [action === 'taken' ? 'taken' : 'skipped']: item[action === 'taken' ? 'taken' : 'skipped'] + 1
          };
        }
        return item;
      }));

      const res = await api.post(`/medicines/${id}/${action}`);
      
      if (action === 'taken') {
        toast.success('Dose recorded! 💊', { duration: 2000 });
      } else {
        toast('Dose skipped', { icon: '⏭️', duration: 2000 });
      }

      fetchDashboardData(); // Full refresh for stats cards
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update. Try again.';
      toast.error(msg);
      fetchDashboardData(); // Revert local state on error
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Health Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Medicines" val={stats.total} icon={<Activity className="text-blue-500"/>} />
        <StatCard title="Due Today" val={stats.due} icon={<CheckCircle2 className="text-emerald-500"/>} />
        <StatCard title="Low Stock Alerts" val={stats.lowStock} icon={<AlertCircle className="text-red-500"/>} color="text-red-600" />
        <StatCard title="Stock Expires In" val={`${stats.minDays} days`} icon={<Package className="text-amber-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {schedule.map((med) => (
              <div key={med._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-900">{med.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                         {med.time}
                         <span className="text-[9px] opacity-60 font-medium">
                           {med.time === 'Morning' ? '(08:00 AM)' : 
                            med.time === 'Afternoon' ? '(02:00 PM)' : 
                            med.time === 'Evening' ? '(06:00 PM)' : 
                            med.time === 'Night' ? '(09:00 PM)' : ''}
                         </span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{med.dosage}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(med._id, 'taken')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-md shadow-emerald-100 transition active:scale-95">Mark Taken</button>
                  <button onClick={() => handleAction(med._id, 'skip')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition">Skip</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">7-Day Adherence</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="taken" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="skipped" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, val, icon, color = "text-slate-900" }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{val}</p>
    </div>
  </div>
);

export default Dashboard;