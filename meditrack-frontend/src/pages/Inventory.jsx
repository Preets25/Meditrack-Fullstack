import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Package, Plus, Search, Edit2, Trash2, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, X, Save, Filter,
  TrendingDown, DollarSign, ShoppingBag, BarChart2
} from 'lucide-react';

// ── helpers ─────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical', 'Drops', 'Inhaler', 'Supplement', 'Device', 'Other'];

const EMPTY_FORM = {
  name: '', genericName: '', category: 'Tablet', manufacturer: '',
  price: '', mrp: '', quantity: '', unit: 'units',
  reorderLevel: '10', expiryDate: '', batchNumber: '',
  requiresPrescription: false, isAvailable: true, description: ''
};

const stockStatus = (item) => {
  if (item.quantity === 0) return 'out';
  if (item.quantity <= item.reorderLevel) return 'low';
  return 'ok';
};

const StatusBadge = ({ item }) => {
  const s = stockStatus(item);
  if (s === 'out') return <span className="inv-badge inv-badge-out">Out of Stock</span>;
  if (s === 'low') return <span className="inv-badge inv-badge-low">Low Stock</span>;
  return <span className="inv-badge inv-badge-ok">In Stock</span>;
};

// ── mock shop (used when backend isn't available) ────────────────
const MOCK_SHOP_ID = 'mock-shop-1';

// ── Inventory Page ───────────────────────────────────────────────
const Inventory = () => {
  const [shopId, setShopId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── fetch my shop then inventory ──
  useEffect(() => {
    (async () => {
      try {
        const shopRes = await api.get('/shops/my');
        const sid = shopRes.data?.data?._id;
        if (!sid) {
          setShopId(null);
          setItems([]);
          return;
        }
        setShopId(sid);
        const invRes = await api.get(`/shops/${sid}/inventory`);
        setItems(invRes.data?.data || []);
      } catch (err) {
        console.error("Inventory fetch failed:", err);
        setShopId(null);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── derived stats ──
  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter(i => i.quantity > 0).length,
    lowStock: items.filter(i => stockStatus(i) === 'low').length,
    outOfStock: items.filter(i => i.quantity === 0).length,
    totalValue: items.reduce((s, i) => s + (i.price * i.quantity), 0)
  }), [items]);

  // ── filtered items ──
  const filtered = useMemo(() => items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.genericName || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || item.category === catFilter;
    return matchSearch && matchCat;
  }), [items, search, catFilter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── open modal ──
  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, genericName: item.genericName || '', category: item.category,
      manufacturer: item.manufacturer || '', price: item.price, mrp: item.mrp || '',
      quantity: item.quantity, unit: item.unit || 'units', reorderLevel: item.reorderLevel || 10,
      expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : '',
      batchNumber: item.batchNumber || '', requiresPrescription: item.requiresPrescription,
      isAvailable: item.isAvailable, description: item.description || ''
    });
    setShowModal(true);
  };

  // ── save ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!shopId) {
      showToast('No shop profile found. Please register your shop first.', 'error');
      return;
    }
    if (!form.name || form.price === '' || form.quantity === '') return;
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp !== '' ? Number(form.mrp) : undefined,
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel)
    };
    try {
      if (editItem) {
        const res = await api.put(`/shops/${shopId}/inventory/${editItem._id}`, payload);
        const updated = res.data?.data || { ...editItem, ...payload };
        setItems(prev => prev.map(i => i._id === editItem._id ? updated : i));
        showToast('Item updated successfully');
      } else {
        const res = await api.post(`/shops/${shopId}/inventory`, payload);
        const newItem = res.data?.data || { _id: Date.now().toString(), ...payload };
        setItems(prev => [newItem, ...prev]);
        showToast('Item added successfully');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save item', 'error');
    }
    setSaving(false);
  };

  // ── delete ──
  const handleDelete = async (item) => {
    try {
      await api.delete(`/shops/${shopId}/inventory/${item._id}`);
      setItems(prev => prev.filter(i => i._id !== item._id));
      setDeleteConfirm(null);
      showToast('Item deleted');
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  // ── toggle availability inline ──
  const toggleAvail = async (item) => {
    try {
      const res = await api.put(`/shops/${shopId}/inventory/${item._id}`, { isAvailable: !item.isAvailable });
      const updated = res.data?.data || { ...item, isAvailable: !item.isAvailable };
      setItems(prev => prev.map(i => i._id === item._id ? updated : i));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="inv-loading">
        <div className="inv-spinner" />
        <p>Loading inventory…</p>
      </div>
    );
  }

  return (
    <div className="inv-root">
      {/* ── Toast ── */}
      {toast && (
        <div className={`inv-toast ${toast.type === 'error' ? 'inv-toast-error' : 'inv-toast-success'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Inventory Management</h1>
          <p className="inv-subtitle">Manage your shop's medicine stock</p>
        </div>
        <button 
          className="inv-btn-primary" 
          onClick={openAdd}
          disabled={!shopId}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="inv-stats">
        <div className="inv-stat-card inv-stat-blue">
          <ShoppingBag size={22} />
          <div>
            <p className="inv-stat-val">{stats.total}</p>
            <p className="inv-stat-lbl">Total Items</p>
          </div>
        </div>
        <div className="inv-stat-card inv-stat-green">
          <CheckCircle size={22} />
          <div>
            <p className="inv-stat-val">{stats.inStock}</p>
            <p className="inv-stat-lbl">In Stock</p>
          </div>
        </div>
        <div className="inv-stat-card inv-stat-amber">
          <AlertTriangle size={22} />
          <div>
            <p className="inv-stat-val">{stats.lowStock}</p>
            <p className="inv-stat-lbl">Low Stock</p>
          </div>
        </div>
        <div className="inv-stat-card inv-stat-red">
          <TrendingDown size={22} />
          <div>
            <p className="inv-stat-val">{stats.outOfStock}</p>
            <p className="inv-stat-lbl">Out of Stock</p>
          </div>
        </div>
        <div className="inv-stat-card inv-stat-purple">
          <DollarSign size={22} />
          <div>
            <p className="inv-stat-val">₹{stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="inv-stat-lbl">Total Value</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="inv-filters">
        <div className="inv-search">
          <Search size={16} className="inv-search-icon" />
          <input
            type="text"
            placeholder="Search by name or generic…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="inv-search-input"
          />
          {search && <button onClick={() => setSearch('')} className="inv-search-clear"><X size={14} /></button>}
        </div>
        <div className="inv-cat-filters">
          <Filter size={15} className="text-slate-400" />
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`inv-cat-btn ${catFilter === c ? 'inv-cat-btn-active' : ''}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {!shopId ? (
        <div className="inv-empty">
          <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No Shop Registered</p>
          <p className="text-sm text-slate-400">You need to register your shop profile before managing inventory.</p>
          <button className="inv-btn-primary mt-4" onClick={() => window.location.href='/shop-settings'}>
            <Plus size={16} /> Register Shop Profile
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="inv-empty">
          <Package size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No items found</p>
          <p className="text-sm text-slate-400">
            {items.length === 0 ? 'Add your first inventory item to get started.' : 'Try adjusting your search or filter.'}
          </p>
          {items.length === 0 && (
            <button className="inv-btn-primary mt-4" onClick={openAdd}><Plus size={16} /> Add First Item</button>
          )}
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className={stockStatus(item) === 'out' ? 'inv-row-out' : ''}>
                  <td>
                    <p className="inv-med-name">{item.name}</p>
                    {item.genericName && <p className="inv-med-generic">{item.genericName}</p>}
                    {item.requiresPrescription && <span className="inv-rx-badge">Rx</span>}
                  </td>
                  <td><span className="inv-cat-tag">{item.category}</span></td>
                  <td>
                    <p className="font-semibold text-slate-800">₹{item.price}</p>
                    {item.mrp && item.mrp !== item.price && <p className="text-xs text-slate-400 line-through">MRP ₹{item.mrp}</p>}
                  </td>
                  <td>
                    <p className={`inv-qty ${stockStatus(item) === 'low' ? 'text-amber-600' : stockStatus(item) === 'out' ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.quantity} <span className="text-xs text-slate-400">{item.unit}</span>
                    </p>
                    <p className="text-xs text-slate-400">Reorder at {item.reorderLevel}</p>
                  </td>
                  <td><StatusBadge item={item} /></td>
                  <td>
                    {item.expiryDate
                      ? <span className={`text-xs font-medium ${new Date(item.expiryDate) < new Date() ? 'text-rose-600' : 'text-slate-600'}`}>
                        {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleAvail(item)}
                      className={`inv-toggle ${item.isAvailable ? 'inv-toggle-on' : 'inv-toggle-off'}`}
                    >{item.isAvailable ? 'Yes' : 'No'}</button>
                  </td>
                  <td>
                    <div className="inv-actions">
                      <button onClick={() => openEdit(item)} className="inv-icon-btn inv-edit-btn" title="Edit"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(item)} className="inv-icon-btn inv-del-btn" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="inv-overlay" onClick={() => setShowModal(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h2>{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setShowModal(false)} className="inv-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="inv-modal-body">
              <div className="inv-form-grid">
                <div className="inv-field inv-col-2">
                  <label>Medicine Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div className="inv-field inv-col-2">
                  <label>Generic Name</label>
                  <input value={form.genericName} onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))} placeholder="e.g. Acetaminophen" />
                </div>
                <div className="inv-field">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="inv-field">
                  <label>Manufacturer</label>
                  <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="e.g. Sun Pharma" />
                </div>
                <div className="inv-field">
                  <label>Selling Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="inv-field">
                  <label>MRP (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="inv-field">
                  <label>Quantity in Stock *</label>
                  <input required type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />
                </div>
                <div className="inv-field">
                  <label>Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {['units', 'strips', 'bottles', 'vials', 'tubes', 'sachets', 'injections'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="inv-field">
                  <label>Reorder Level</label>
                  <input type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} />
                </div>
                <div className="inv-field">
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={form.expiryDate} 
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} 
                  />
                </div>
                <div className="inv-field">
                  <label>Batch Number</label>
                  <input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} placeholder="e.g. BT2024051" />
                </div>
                <div className="inv-field inv-checkrow">
                  <label className="inv-checkbox-label">
                    <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))} />
                    Requires Prescription (Rx)
                  </label>
                  <label className="inv-checkbox-label">
                    <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                    Available to Customers
                  </label>
                </div>
                <div className="inv-field inv-col-2">
                  <label>Description / Notes</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Any special notes…" />
                </div>
              </div>
              <div className="inv-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="inv-btn-ghost">Cancel</button>
                <button type="submit" className="inv-btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving…' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="inv-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="inv-confirm" onClick={e => e.stopPropagation()}>
            <div className="inv-confirm-icon"><Trash2 size={24} /></div>
            <h3>Delete "{deleteConfirm.name}"?</h3>
            <p>This action cannot be undone. The item will be permanently removed from your inventory.</p>
            <div className="inv-confirm-btns">
              <button onClick={() => setDeleteConfirm(null)} className="inv-btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="inv-btn-danger">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .inv-root { padding: 2rem; background: #f8fafc; min-height: 100vh; position: relative; }
        .inv-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:1rem; color:#64748b; }
        .inv-spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#6366f1; border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .inv-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.75rem; gap:1rem; flex-wrap:wrap; }
        .inv-title { font-size:1.75rem; font-weight:800; color:#0f172a; letter-spacing:-0.3px; }
        .inv-subtitle { color:#64748b; margin-top:0.2rem; font-size:0.95rem; }

        .inv-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-bottom:1.75rem; }
        .inv-stat-card { display:flex; align-items:center; gap:0.85rem; padding:1.1rem 1.25rem; border-radius:14px; font-weight:600; background:white; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .inv-stat-blue  { color:#3b82f6; } .inv-stat-green { color:#22c55e; }
        .inv-stat-amber { color:#f59e0b; } .inv-stat-red   { color:#ef4444; } .inv-stat-purple{ color:#8b5cf6;}
        .inv-stat-val { font-size:1.4rem; font-weight:800; color:#0f172a; line-height:1; }
        .inv-stat-lbl { font-size:0.75rem; color:#94a3b8; font-weight:500; margin-top:2px; }

        .inv-filters { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .inv-search { position:relative; flex:1; max-width:360px; }
        .inv-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; }
        .inv-search-input { width:100%; padding:0.6rem 0.75rem 0.6rem 2.25rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; transition:border-color .2s; background:white; }
        .inv-search-input:focus { border-color:#6366f1; }
        .inv-search-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; display:flex; align-items:center; }
        .inv-cat-filters { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
        .inv-cat-btn { padding:0.35rem 0.85rem; border-radius:20px; border:1.5px solid #e2e8f0; background:white; font-size:0.78rem; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
        .inv-cat-btn:hover { border-color:#6366f1; color:#6366f1; }
        .inv-cat-btn-active { background:#6366f1; border-color:#6366f1; color:white !important; }

        .inv-table-wrap { background:white; border-radius:16px; border:1px solid #e2e8f0; overflow:auto; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .inv-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
        .inv-table thead tr { background:#f8fafc; }
        .inv-table th { padding:0.85rem 1rem; text-align:left; font-size:0.75rem; font-weight:700; color:#64748b; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
        .inv-table td { padding:0.9rem 1rem; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .inv-table tbody tr:last-child td { border-bottom:none; }
        .inv-table tbody tr:hover { background:#fafbff; }
        .inv-row-out { opacity:.7; }

        .inv-med-name { font-weight:600; color:#1e293b; }
        .inv-med-generic { font-size:0.75rem; color:#94a3b8; margin-top:1px; }
        .inv-rx-badge { display:inline-block; margin-top:3px; padding:1px 6px; background:#fef3c7; color:#92400e; border-radius:4px; font-size:0.65rem; font-weight:700; letter-spacing:.5px; }
        .inv-cat-tag { display:inline-block; padding:0.25rem 0.65rem; background:#ede9fe; color:#6d28d9; border-radius:20px; font-size:0.72rem; font-weight:600; white-space:nowrap; }
        .inv-qty { font-weight:700; font-size:1rem; }

        .inv-badge { display:inline-block; padding:0.25rem 0.65rem; border-radius:20px; font-size:0.72rem; font-weight:700; white-space:nowrap; }
        .inv-badge-ok  { background:#dcfce7; color:#15803d; }
        .inv-badge-low { background:#fef9c3; color:#a16207; }
        .inv-badge-out { background:#fee2e2; color:#dc2626; }

        .inv-toggle { padding:0.25rem 0.65rem; border-radius:20px; border:none; font-size:0.72rem; font-weight:700; cursor:pointer; transition:all .15s; }
        .inv-toggle-on  { background:#dcfce7; color:#15803d; }
        .inv-toggle-off { background:#f1f5f9; color:#94a3b8; }

        .inv-actions { display:flex; gap:0.5rem; }
        .inv-icon-btn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:none; cursor:pointer; transition:all .15s; }
        .inv-edit-btn { background:#ede9fe; color:#6d28d9; } .inv-edit-btn:hover { background:#ddd6fe; }
        .inv-del-btn  { background:#fee2e2; color:#dc2626; } .inv-del-btn:hover { background:#fecaca; }

        .inv-empty { text-align:center; padding:4rem 2rem; background:white; border-radius:16px; border:1px solid #e2e8f0; color:#64748b; }

        /* Modal */
        .inv-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); padding:1rem; }
        .inv-modal { background:white; border-radius:20px; width:100%; max-width:720px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 25px 50px rgba(0,0,0,.2); overflow:hidden; }
        .inv-modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; }
        .inv-modal-header h2 { font-size:1.15rem; font-weight:700; color:#0f172a; }
        .inv-modal-close { background:none; border:none; color:#94a3b8; cursor:pointer; display:flex; align-items:center; transition:color .15s; }
        .inv-modal-close:hover { color:#1e293b; }
        .inv-modal-body { overflow-y:auto; padding:1.5rem; flex:1; }
        .inv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .inv-field { display:flex; flex-direction:column; gap:0.35rem; }
        .inv-field label { font-size:0.8rem; font-weight:600; color:#475569; }
        .inv-field input, .inv-field select, .inv-field textarea { padding:0.6rem 0.75rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.875rem; outline:none; transition:border-color .2s; font-family:inherit; resize:vertical; }
        .inv-field input:focus, .inv-field select:focus, .inv-field textarea:focus { border-color:#6366f1; }
        .inv-col-2 { grid-column:span 2; }
        .inv-checkrow { flex-direction:row; align-items:center; gap:1.5rem; grid-column:span 2; }
        .inv-checkbox-label { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:#475569; font-weight:500; cursor:pointer; }
        .inv-checkbox-label input { width:15px; height:15px; cursor:pointer; accent-color:#6366f1; }
        .inv-modal-footer { display:flex; justify-content:flex-end; gap:0.75rem; padding:1rem 1.5rem; border-top:1px solid #e2e8f0; }

        .inv-btn-primary { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.25rem; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border:none; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; transition:opacity .15s; }
        .inv-btn-primary:hover { opacity:.9; }
        .inv-btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .inv-btn-ghost { padding:0.65rem 1.25rem; background:white; color:#64748b; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; transition:all .15s; }
        .inv-btn-ghost:hover { border-color:#cbd5e1; color:#1e293b; }
        .inv-btn-danger { padding:0.65rem 1.25rem; background:#ef4444; color:white; border:none; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; transition:opacity .15s; }
        .inv-btn-danger:hover { opacity:.9; }

        /* Confirm dialog */
        .inv-confirm { background:white; border-radius:20px; padding:2rem; max-width:380px; width:100%; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,.2); }
        .inv-confirm-icon { display:inline-flex; padding:1rem; background:#fee2e2; border-radius:50%; color:#dc2626; margin-bottom:1rem; }
        .inv-confirm h3 { font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:0.5rem; }
        .inv-confirm p { color:#64748b; font-size:0.875rem; margin-bottom:1.5rem; }
        .inv-confirm-btns { display:flex; gap:0.75rem; justify-content:center; }

        /* Toast */
        .inv-toast { position:fixed; bottom:1.5rem; right:1.5rem; display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1.25rem; border-radius:12px; font-size:0.875rem; font-weight:600; z-index:2000; box-shadow:0 10px 25px rgba(0,0,0,.15); animation:slideUp .3s ease; }
        .inv-toast-success { background:#0f172a; color:white; }
        .inv-toast-error   { background:#ef4444; color:white; }
        @keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

        @media(max-width:640px){
          .inv-root { padding:1rem; }
          .inv-form-grid { grid-template-columns:1fr; }
          .inv-col-2 { grid-column:span 1; }
          .inv-checkrow { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
    </div>
  );
};

export default Inventory;
