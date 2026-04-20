import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, Settings, ClipboardList, CheckCircle2, XCircle, Clock, Truck, IndianRupee, User, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_META = {
  Pending:            { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending',           icon: Clock },
  Accepted:           { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Accepted',          icon: CheckCircle2 },
  'Ready for Pickup': { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'Ready for Pickup',  icon: Truck },
  Completed:          { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed',         icon: CheckCircle2 },
  Cancelled:          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled',         icon: XCircle },
};

const NEXT_STATUS = {
  Pending:            { label: 'Accept Order',    next: 'Accepted',           btnColor: '#3b82f6' },
  Accepted:           { label: 'Mark Ready',      next: 'Ready for Pickup',   btnColor: '#7c3aed' },
  'Ready for Pickup': { label: 'Mark Completed',  next: 'Completed',          btnColor: '#16a34a' },
};

const ShopOwnerDashboard = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [priceEdits, setPriceEdits] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/shop');
      setOrders(res.data.orders || []);
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Could not load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, payload, successMsg) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}`, payload);
      toast.success(successMsg);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    updateOrder(id, { status: 'Cancelled' }, 'Order cancelled.');
  };

  const pending   = orders.filter(o => o.status === 'Pending');
  const active    = orders.filter(o => ['Accepted', 'Ready for Pickup'].includes(o.status));
  const history   = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));
  const todayEarnings = orders.filter(o => o.status === 'Completed' && new Date(o.updatedAt).toDateString() === new Date().toDateString())
                              .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="p-6 md:p-10 animate-fade-in-up" style={{ background: '#f4f6ff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Shop Dashboard</h1>
          <p style={{ color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>Manage incoming orders and your pharmacy listing</p>
        </div>
        <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', background: 'white', border: '1.5px solid #e8eaf6', borderRadius: '0.875rem', color: '#64748b', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending Orders', val: pending.length,  color: '#d97706', bg: '#fffbeb' },
          { label: 'Active Orders',  val: active.length,   color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Completed Today',val: orders.filter(o => o.status === 'Completed' && new Date(o.updatedAt).toDateString() === new Date().toDateString()).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: "Today's Revenue", val: `₹${todayEarnings}`, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1.5px solid #e8eaf6', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(79,70,229,0.05)' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1.2, marginTop: 4 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { to: '/inventory',     icon: Package,  label: 'Inventory',     sub: 'Stock management' },
          { to: '/shop-settings', icon: Settings, label: 'Shop Settings', sub: 'Profile & hours' },
          { to: '/shops',         icon: Store,    label: 'Directory',     sub: 'View listing' },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to} style={{ background: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '1.5px solid #e8eaf6', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(79,70,229,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}>
            <div style={{ width: 40, height: 40, background: '#eef2ff', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} style={{ color: '#4f46e5' }} />
            </div>
            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>{label}</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Pending Orders ─────────────────────────────────────────── */}
      <OrderSection
        title={`Incoming Requests`}
        badge={pending.length}
        badgeColor="#d97706"
        orders={pending}
        loading={loading}
        updatingId={updatingId}
        priceEdits={priceEdits}
        setPriceEdits={setPriceEdits}
        updateOrder={updateOrder}
        cancelOrder={cancelOrder}
        emptyMsg="No pending orders right now."
      />

      {/* ── Active Orders ──────────────────────────────────────────── */}
      {active.length > 0 && (
        <OrderSection
          title="Active Orders"
          badge={active.length}
          badgeColor="#3b82f6"
          orders={active}
          loading={false}
          updatingId={updatingId}
          priceEdits={priceEdits}
          setPriceEdits={setPriceEdits}
          updateOrder={updateOrder}
          cancelOrder={cancelOrder}
        />
      )}

      {/* ── History ────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <details style={{ marginTop: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#64748b', padding: '0.75rem 0', userSelect: 'none' }}>
            Order History ({history.length})
          </summary>
          <OrderSection
            title=""
            orders={history}
            loading={false}
            updatingId={updatingId}
            priceEdits={priceEdits}
            setPriceEdits={setPriceEdits}
            updateOrder={updateOrder}
            cancelOrder={cancelOrder}
            readOnly
          />
        </details>
      )}
    </div>
  );
};

/* ── Order Section Component ─────────────────────────────────────── */
const OrderSection = ({ title, badge, badgeColor, orders, loading, updatingId, priceEdits, setPriceEdits, updateOrder, cancelOrder, emptyMsg, readOnly }) => (
  <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '1.5rem', padding: '1.5rem 1.75rem', border: '1.5px solid #e8eaf6', boxShadow: '0 2px 12px rgba(79,70,229,0.05)' }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <ClipboardList size={20} style={{ color: '#4f46e5' }} />
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
        {badge !== undefined && (
          <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '0.8rem', padding: '3px 12px', borderRadius: '999px', background: badgeColor + '20', color: badgeColor }}>
            {badge} {badge === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>
    )}

    {loading ? (
      <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e8eaf6', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
        Loading…
      </div>
    ) : orders.length === 0 ? (
      <p style={{ color: '#94a3b8', fontWeight: 500, textAlign: 'center', padding: '1.5rem 0' }}>
        {emptyMsg || 'No orders here.'}
      </p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => {
          const meta   = STATUS_META[order.status] || STATUS_META['Pending'];
          const StatusIcon = meta.icon;
          const next   = NEXT_STATUS[order.status];
          const price  = priceEdits[order._id] ?? (order.price || '');
          const isUpdating = updatingId === order._id;

          return (
            <div key={order._id} style={{ background: '#f8faff', borderRadius: '1.125rem', padding: '1.25rem 1.5rem', border: `1.5px solid ${meta.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a' }}>{order.medicineName}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', gap: 4, border: `1px solid ${meta.border}` }}>
                      <StatusIcon size={11} /> {meta.label}
                    </span>
                    {order.paymentStatus === 'Paid' && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        ✓ Paid
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> {order.patientId?.name || 'Patient'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Qty: {order.quantity}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>{order.paymentMethod || 'Cash'}</span>
                    {order.totalAmount > 0 && <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4f46e5' }}>₹{order.totalAmount}</span>}
                    {order.notes && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>"{order.notes}"</span>}
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#cbd5e1', fontWeight: 500, marginTop: 4 }}>
                    {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Price setter */}
                {!readOnly && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="number"
                        placeholder="Set price"
                        value={price}
                        onChange={e => setPriceEdits(p => ({ ...p, [order._id]: e.target.value }))}
                        style={{ width: 110, paddingLeft: 26, paddingRight: 8, paddingTop: 7, paddingBottom: 7, border: '1.5px solid #e8eaf6', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, outline: 'none', background: 'white', color: '#0f172a' }}
                      />
                    </div>
                    <button
                      onClick={() => updateOrder(order._id, { price: Number(price) }, 'Price updated!')}
                      disabled={!price || isUpdating}
                      style={{ padding: '7px 14px', background: '#eef2ff', color: '#4f46e5', border: '1.5px solid #c7d2fe', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Set
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!readOnly && (
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {next && (
                    <button
                      onClick={() => updateOrder(order._id, { status: next.next }, `Order ${next.next}!`)}
                      disabled={isUpdating}
                      style={{ padding: '8px 18px', background: next.btnColor, color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', boxShadow: `0 4px 12px ${next.btnColor}40`, opacity: isUpdating ? 0.6 : 1 }}>
                      {isUpdating ? '…' : next.label}
                    </button>
                  )}
                  {order.status === 'Completed' && order.paymentStatus === 'Unpaid' && (
                    <button
                      onClick={() => updateOrder(order._id, { paymentStatus: 'Paid' }, '✓ Payment recorded!')}
                      disabled={isUpdating}
                      style={{ padding: '8px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                      Mark Paid ₹{order.totalAmount || '—'}
                    </button>
                  )}
                  {!['Completed', 'Cancelled'].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      style={{ padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default ShopOwnerDashboard;
