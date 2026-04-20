import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  ShoppingCart, Package, CheckCircle2, XCircle, Clock,
  MapPin, Plus, Minus, CreditCard, Banknote, Smartphone,
  ChevronDown, Trash2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['Pending', 'Accepted', 'Ready for Pickup', 'Completed'];

const STATUS_META = {
  Pending:            { color: '#f59e0b', bg: '#fffbeb', label: 'Pending',          icon: Clock },
  Accepted:           { color: '#3b82f6', bg: '#eff6ff', label: 'Accepted',         icon: CheckCircle2 },
  'Ready for Pickup': { color: '#8b5cf6', bg: '#f5f3ff', label: 'Ready for Pickup', icon: Package },
  Completed:          { color: '#10b981', bg: '#f0fdf4', label: 'Completed',        icon: CheckCircle2 },
  Cancelled:          { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled',        icon: XCircle },
};

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash on Pickup', icon: Banknote },
  { id: 'UPI',  label: 'UPI / QR Code',  icon: Smartphone },
  { id: 'Card', label: 'Debit / Credit', icon: CreditCard },
];

// ── QR code placeholder panel ─────────────────────────────────────────
const UPIPanel = () => (
  <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f8faff', borderRadius: '1.25rem', border: '1.5px dashed #c7d2fe', textAlign: 'center' }}>
    {/* Simulated QR code grid */}
    <div style={{ width: 120, height: 120, margin: '0 auto 1rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 8, background: 'white', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(79,70,229,0.1)' }}>
      {Array.from({ length: 49 }).map((_, i) => {
        // corner squares pattern to look like a QR code
        const corners = [0,1,2,7,8,14,6,13,34,40,41,42,47,48,35];
        const random  = [3,5,9,11,12,16,18,20,22,25,27,29,31,33,36,38,44,46];
        const dark = corners.includes(i) || random.includes(i);
        return (
          <div key={i} style={{ borderRadius: 2, background: dark ? '#4f46e5' : '#f1f5f9' }} />
        );
      })}
    </div>
    <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Scan to Pay via UPI</p>
    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>meditrack@upi</p>
    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', fontStyle: 'italic' }}>
      Your order is confirmed upon pharmacy acceptance.
    </p>
  </div>
);

// ── Debit / Credit card input panel ──────────────────────────────────
const CardPanel = ({ card, setCard }) => (
  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1.5rem', background: '#f8faff', borderRadius: '1.25rem', border: '1.5px solid #e8eaf6' }}>
    <div>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>Card Number</label>
      <input
        className="input-premium"
        maxLength={19}
        placeholder="0000  0000  0000  0000"
        value={card.number}
        onChange={e => {
          // Format with spaces every 4 digits
          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
          const formatted = raw.replace(/(.{4})/g, '$1  ').trim();
          setCard(c => ({ ...c, number: formatted }));
        }}
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
      <div>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>Expiry</label>
        <input
          className="input-premium"
          maxLength={5}
          placeholder="MM/YY"
          value={card.expiry}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
            const formatted = raw.length > 2 ? `${raw.slice(0,2)}/${raw.slice(2)}` : raw;
            setCard(c => ({ ...c, expiry: formatted }));
          }}
        />
      </div>
      <div>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>CVV</label>
        <input
          className="input-premium"
          maxLength={4}
          type="password"
          placeholder="•••"
          value={card.cvv}
          onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
        />
      </div>
    </div>
    <p style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      🔒 Card details are only used for demonstration purposes.
    </p>
  </div>
);


/* ── Reusable order card ─────────────────────────────── */
const OrderCard = ({ order, onCancel, onDelete }) => {
  const meta     = STATUS_META[order.status] || STATUS_META['Pending'];
  const StatusIcon = meta.icon;
  const stepIdx  = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div
      className="card-premium"
      style={{
        padding: '1.75rem',
        borderLeft: isCancelled ? '4px solid #fca5a5' : undefined,
        opacity: isCancelled ? 0.95 : 1,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {order.medicineName}
            </h3>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', padding: '3px 12px', borderRadius: '999px', background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StatusIcon size={12} /> {meta.label}
            </span>
            {order.paymentStatus === 'Paid' && (
              <span style={{ fontWeight: 700, fontSize: '0.75rem', padding: '3px 10px', borderRadius: '999px', background: '#f0fdf4', color: '#16a34a' }}>
                ✓ Paid
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} /> {order.shopId?.name || 'Shop'}{order.shopId?.city ? `, ${order.shopId.city}` : ''}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Qty: {order.quantity}</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{order.paymentMethod || 'Cash'}</span>
            {order.totalAmount > 0 && (
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5' }}>₹{order.totalAmount}</span>
            )}
          </div>

          {order.notes && (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.375rem', fontStyle: 'italic' }}>"{order.notes}"</p>
          )}
        </div>

        {/* Actions column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          {/* Cancel button — only for non-terminal orders */}
          {!['Completed', 'Cancelled'].includes(order.status) && (
            <button
              onClick={() => onCancel(order._id)}
              style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel Order
            </button>
          )}

          {/* Delete button — only for cancelled orders */}
          {isCancelled && (
            <button
              onClick={() => onDelete(order._id)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff1f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker — only for active orders */}
      {!isCancelled && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STATUS_STEPS.map((step, idx) => {
            const done    = idx <= stepIdx;
            const current = idx === stepIdx;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: current ? 28 : 20, height: current ? 28 : 20, borderRadius: '50%',
                    border: done ? 'none' : '2px solid #e8eaf6',
                    background: done ? (current ? '#4f46e5' : '#c7d2fe') : '#f8faff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s', boxShadow: current ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
                  }}>
                    {done && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: current ? 700 : 500, color: done ? '#4f46e5' : '#94a3b8', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: idx < stepIdx ? '#c7d2fe' : '#e8eaf6', marginBottom: 18 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Main page ───────────────────────────────────────── */
const OrdersPage = () => {
  const [shops, setShops]       = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab]   = useState('active'); // 'active' | 'cancelled'
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });  // card details state

  const [form, setForm] = useState({
    shopId: '', medicineName: '', quantity: 1, notes: '', paymentMethod: 'Cash'
  });

  const fetchAll = async () => {
    try {
      const [ordersRes, shopsRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/shops'),
      ]);
      setOrders(ordersRes.data.orders || []);
      setShops(shopsRes.data.data || shopsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Derived lists ──
  const activeOrders    = useMemo(() => orders.filter(o => o.status !== 'Cancelled'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'Cancelled'), [orders]);

  // ── Handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopId || !form.medicineName.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }
    // Card validation
    if (form.paymentMethod === 'Card') {
      if (card.number.replace(/\s/g, '').length < 16) { toast.error('Enter a valid 16-digit card number.'); return; }
      if (card.expiry.length < 5)                     { toast.error('Enter a valid expiry date (MM/YY).'); return; }
      if (card.cvv.length < 3)                        { toast.error('Enter a valid CVV.'); return; }
    }
    setSubmitting(true);
    try {
      await api.post('/orders', {
        shopId: form.shopId, medicineName: form.medicineName,
        quantity: form.quantity, notes: form.notes, paymentMethod: form.paymentMethod,
        // Card details stored client-side only (not persisted to DB in demo mode)
      });
      toast.success('Order placed successfully! 🎉');
      setShowForm(false);
      setForm({ shopId: '', medicineName: '', quantity: 1, notes: '', paymentMethod: 'Cash' });
      setCard({ number: '', expiry: '', cvv: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this cancelled order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success('Order deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '0.75rem', color: '#64748b' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e8eaf6', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading orders…
    </div>
  );

  return (
    <div className="p-6 md:p-10 animate-fade-in-up">

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>My Orders</h1>
          <p style={{ color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>Order medicines from local pharmacies</p>
        </div>
        <button className="btn-premium" onClick={() => setShowForm(!showForm)} style={{ gap: '0.5rem' }}>
          <Plus size={18} /> {showForm ? 'Close Form' : 'New Order'}
        </button>
      </div>

      {/* ── New Order Form ── */}
      {showForm && (
        <div className="card-premium" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '3px solid #4f46e5' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Place a New Order</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Shop */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Select Pharmacy *</label>
                <div style={{ position: 'relative' }}>
                  <select required className="input-premium" value={form.shopId}
                    onChange={e => setForm(f => ({ ...f, shopId: e.target.value }))}
                    style={{ appearance: 'none', paddingRight: '2.5rem' }}>
                    <option value="">Choose a shop…</option>
                    {shops.map(s => <option key={s._id} value={s._id}>{s.name}{s.city ? ` — ${s.city}` : ''}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Medicine name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medicine Name *</label>
                <input required className="input-premium" placeholder="e.g. Paracetamol 500mg"
                  value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))} />
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                    style={{ width: 40, height: 40, borderRadius: '0.75rem', border: '1.5px solid #e8eaf6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', minWidth: 28, textAlign: 'center' }}>{form.quantity}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                    style={{ width: 40, height: 40, borderRadius: '0.75rem', border: '1.5px solid #e8eaf6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notes (optional)</label>
                <input className="input-premium" placeholder="Any special instructions…"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>Payment Method</label>

              {/* Radio-style button group */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {PAYMENT_METHODS.map(pm => {
                  const Icon   = pm.icon;
                  const active = form.paymentMethod === pm.id;
                  return (
                    <label
                      key={pm.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', borderRadius: '0.875rem', border: active ? '2px solid #4f46e5' : '1.5px solid #e8eaf6', background: active ? '#eef2ff' : 'white', color: active ? '#4f46e5' : '#64748b', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={form.paymentMethod === pm.id}
                        onChange={() => setForm(f => ({ ...f, paymentMethod: pm.id }))}
                        style={{ display: 'none' }}
                      />
                      <Icon size={16} /> {pm.label}
                    </label>
                  );
                })}
              </div>

              {/* Conditional detail panels */}
              {form.paymentMethod === 'UPI'  && <UPIPanel />}
              {form.paymentMethod === 'Card' && <CardPanel card={card} setCard={setCard} />}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: '0.875rem 1.5rem', borderRadius: '0.875rem', border: '1.5px solid #e8eaf6', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-premium" style={{ flex: 1 }}>
                {submitting ? 'Placing Order…' : '🛒 Confirm Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '14px', width: 'fit-content' }}>
        {[
          { id: 'active',    label: `Active Orders`,    count: activeOrders.length },
          { id: 'cancelled', label: `Cancelled Orders`, count: cancelledOrders.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
              fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color:      activeTab === tab.id ? (tab.id === 'cancelled' ? '#ef4444' : '#4f46e5') : '#64748b',
              boxShadow:  activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, background: activeTab === tab.id ? (tab.id === 'cancelled' ? '#fef2f2' : '#eef2ff') : '#e2e8f0', color: activeTab === tab.id ? (tab.id === 'cancelled' ? '#ef4444' : '#4f46e5') : '#94a3b8' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Active Orders Tab ── */}
      {activeTab === 'active' && (
        activeOrders.length === 0 ? (
          <div className="card-premium" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ShoppingCart size={48} style={{ color: '#c7d2fe', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#475569', fontSize: '1.25rem' }}>No active orders</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Click "New Order" to request medicines from a nearby pharmacy.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeOrders.map(order => (
              <OrderCard key={order._id} order={order} onCancel={handleCancel} onDelete={handleDelete} />
            ))}
          </div>
        )
      )}

      {/* ── Cancelled Orders Tab ── */}
      {activeTab === 'cancelled' && (
        cancelledOrders.length === 0 ? (
          <div className="card-premium" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <XCircle size={36} style={{ color: '#fca5a5' }} />
            </div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#475569', fontSize: '1.25rem' }}>No cancelled orders</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>You haven't cancelled any orders.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Info banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: '#fef2f2', borderRadius: '1rem', border: '1.5px solid #fecaca' }}>
              <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: 600 }}>
                These orders have been cancelled. You can delete them to keep your history clean.
              </p>
            </div>

            {cancelledOrders.map(order => (
              <OrderCard key={order._id} order={order} onCancel={handleCancel} onDelete={handleDelete} />
            ))}
          </div>
        )
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrdersPage;
