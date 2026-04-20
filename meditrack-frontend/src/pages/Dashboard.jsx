import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Package, AlertCircle, CheckCircle2, Search, MapPin, ShoppingCart, X, CreditCard, Banknote, Smartphone, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ── Payment modal ───────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  { id: 'Cash',   label: 'Cash on Pickup',  icon: Banknote },
  { id: 'UPI',    label: 'UPI / QR Code',   icon: Smartphone },
  { id: 'Card',   label: 'Debit / Credit',  icon: CreditCard },
];

const PaymentModal = ({ item, onClose, onSuccess }) => {
  const [qty, setQty]         = useState(1);
  const [method, setMethod]   = useState('Cash');
  const [notes, setNotes]     = useState('');
  const [paying, setPaying]   = useState(false);
  const [paid, setPaid]       = useState(false);

  const price      = item?.price || 0;
  const total      = price * qty;
  const shopId     = item?.shopId?._id || item?.shopId;
  const shopName   = item?.shopId?.name || 'Pharmacy';

  const handleOrder = async () => {
    setPaying(true);
    try {
      await api.post('/orders', {
        shopId,
        medicineName: item.name,
        quantity: qty,
        price,
        paymentMethod: method,
        notes,
      });
      setPaid(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '2rem', width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header bar */}
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order from {shopName}</p>
            <h2 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>{item.name}</h2>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={18} />
          </button>
        </div>

        {paid ? (
          /* Success state */
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '3px solid #86efac' }}>
              <CheckCircle2 size={36} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>Order Confirmed!</h3>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>
              Your order for <strong>{item.name}</strong> has been sent to {shopName}.
            </p>
            <p style={{ color: '#4f46e5', fontWeight: 700, marginTop: '0.5rem', fontSize: '1.125rem' }}>₹{total} — {method}</p>
          </div>
        ) : (
          <div style={{ padding: '1.75rem' }}>
            {/* Price summary */}
            <div style={{ background: '#f8faff', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1.5px solid #e8eaf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Price per unit</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#4f46e5' }}>₹{price}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>₹{total}</p>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.625rem' }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 40, height: 40, borderRadius: '0.75rem', border: '1.5px solid #e8eaf6', background: '#f8faff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '1.25rem', fontWeight: 700 }}>
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  style={{ width: 40, height: 40, borderRadius: '0.75rem', border: '1.5px solid #e8eaf6', background: '#f8faff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '1.25rem', fontWeight: 700 }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.625rem' }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.625rem' }}>
                {PAYMENT_METHODS.map(pm => {
                  const Icon = pm.icon;
                  const active = method === pm.id;
                  return (
                    <button key={pm.id} type="button" onClick={() => setMethod(pm.id)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.75rem 0.5rem', borderRadius: '0.875rem', border: active ? '2px solid #4f46e5' : '1.5px solid #e8eaf6', background: active ? '#eef2ff' : 'white', color: active ? '#4f46e5' : '#64748b', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                      <Icon size={18} />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>Special Notes (optional)</label>
              <input
                className="input-premium"
                placeholder="e.g. need strips, not loose tablets"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Confirm button */}
            <button
              onClick={handleOrder}
              disabled={paying}
              className="btn-premium"
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
            >
              {paying ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Processing…
                </>
              ) : (
                <><ShoppingCart size={18} /> Confirm & Pay ₹{total}</>
              )}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ── Main Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats]           = useState({ total: 0, due: 0, lowStock: 0, minDays: 0 });
  const [schedule, setSchedule]     = useState([]);
  const [chartData, setChartData]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [orderItem, setOrderItem]         = useState(null); // item to order

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
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
    } catch (err) { console.error('Fetch error', err); }
  };

  const handleAction = async (id, action) => {
    try {
      setSchedule(prev => prev.filter(item => item._id !== id));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = days[new Date().getDay()];
      setChartData(prev => prev.map(item => item.day === currentDay
        ? { ...item, [action === 'taken' ? 'taken' : 'skipped']: item[action === 'taken' ? 'taken' : 'skipped'] + 1 }
        : item));
      await api.post(`/medicines/${id}/${action}`);
      if (action === 'taken') toast.success('Dose recorded! 💊', { duration: 2000 });
      else toast('Dose skipped', { icon: '⏭️', duration: 2000 });
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update. Try again.');
      fetchDashboardData();
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/shops/search?q=${searchQuery}`);
      setSearchResults(res.data.results || []);
      if ((res.data.results?.length || 0) === 0) toast.error('No nearby shops have this medicine in stock.');
    } catch { toast.error('Search failed'); }
    finally { setIsSearching(false); }
  };

  return (
    <div className="p-6 animate-fade-in-up" style={{ background: '#f4f6ff', minHeight: '100vh' }}>

      {/* Payment modal */}
      {orderItem && (
        <PaymentModal
          item={orderItem}
          onClose={() => setOrderItem(null)}
          onSuccess={() => { toast.success('Order placed! Track it in My Orders.', { icon: '🎉', duration: 3500 }); }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Health Overview</h1>
          <p style={{ color: '#64748b', fontWeight: 500, marginTop: 2 }}>Your personalised medication dashboard</p>
        </div>

        {/* Medicine search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search medicine in local shops…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 3.5rem 0.75rem 2.5rem', background: 'white', border: '1.5px solid #e8eaf6', borderRadius: '0.875rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxShadow: '0 2px 8px rgba(79,70,229,0.06)' }}
          />
          <button type="submit"
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '5px 14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            {isSearching ? '…' : 'Find'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: '2rem', background: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1.5px solid #e8eaf6', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
              Results for "{searchQuery}"
            </h2>
            <button onClick={() => setSearchResults([])} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              Clear
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {searchResults.map(item => (
              <div key={item._id} style={{ background: '#f8faff', borderRadius: '1.125rem', padding: '1.125rem', border: '1.5px solid #e8eaf6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {item.shopId?.name} • {item.shopId?.city}
                    </p>
                  </div>
                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.1rem' }}>₹{item.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '999px' }}>
                    In Stock: {item.quantity}
                  </span>
                  <button
                    onClick={() => setOrderItem(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '6px 14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                    <ShoppingCart size={13} /> Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Medicines" val={stats.total}       icon={<Activity size={20} style={{ color: '#4f46e5' }} />} accent="#eef2ff" />
        <StatCard title="Due Today"       val={stats.due}         icon={<CheckCircle2 size={20} style={{ color: '#10b981' }} />} accent="#f0fdf4" />
        <StatCard title="Low Stock"       val={stats.lowStock}    icon={<AlertCircle size={20} style={{ color: '#ef4444' }} />} accent="#fef2f2" valColor="#ef4444" />
        <StatCard title="Stock Expires"   val={`${stats.minDays}d`} icon={<Package size={20} style={{ color: '#f59e0b' }} />} accent="#fffbeb" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Schedule */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem 1.75rem', border: '1.5px solid #e8eaf6', boxShadow: '0 2px 12px rgba(79,70,229,0.05)' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Today's Schedule</h2>
          {schedule.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', color: '#bbf7d0' }} />
              <p style={{ fontWeight: 600 }}>All done for today! 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {schedule.map(med => (
                <div key={med._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f8faff', borderRadius: '1rem', border: '1.5px solid #e8eaf6' }}>
                  <div>
                    <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>{med.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: '999px' }}>{med.time}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{med.dosage}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleAction(med._id, 'taken')} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                      ✓ Taken
                    </button>
                    <button onClick={() => handleAction(med._id, 'skip')} style={{ padding: '8px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem 1.75rem', border: '1.5px solid #e8eaf6', boxShadow: '0 2px 12px rgba(79,70,229,0.05)' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>7-Day Adherence</h2>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e8eaf6', fontFamily: 'Inter', fontSize: 13 }} />
                <Bar dataKey="taken"   fill="#4f46e5" radius={[6, 6, 0, 0]} name="Taken" />
                <Bar dataKey="skipped" fill="#e8eaf6" radius={[6, 6, 0, 0]} name="Skipped" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#4f46e5', display: 'inline-block' }} /> Taken
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e8eaf6', display: 'inline-block' }} /> Skipped
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, val, icon, accent = '#f8faff', valColor = '#0f172a' }) => (
  <div style={{ background: 'white', border: '1.5px solid #e8eaf6', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(79,70,229,0.05)' }}>
    <div style={{ width: 44, height: 44, background: accent, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{title}</p>
      <p style={{ fontSize: '1.375rem', fontWeight: 800, color: valColor, lineHeight: 1.2 }}>{val}</p>
    </div>
  </div>
);

export default Dashboard;