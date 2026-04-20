import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pill, Trash2, Calendar, ShoppingCart, Upload, Pencil, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const SLOTS = [
  { label: 'Morning',   time: '08:00 AM' },
  { label: 'Afternoon', time: '02:00 PM' },
  { label: 'Evening',   time: '06:00 PM' },
  { label: 'Night',     time: '09:00 PM' },
];

const EMPTY_MED = {
  name: '', dosage: '', time: '', stock: '',
  startDate: new Date().toISOString().split('T')[0],
  slots: [], isMonthly: false, prescriptionFile: null,
  reminderEmail: '', stockAlertLevel: 10,
};

const Medicines = () => {
  const [medicines, setMedicines]   = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editMed, setEditMed]       = useState(null); // null = adding, object = editing
  const [form, setForm]             = useState(EMPTY_MED);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      const raw = res.data?.data ?? res.data;
      setMedicines(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
      setMedicines([]);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const toggleSlot = (s) => {
    setForm(prev => ({
      ...prev,
      slots: prev.slots.includes(s) ? prev.slots.filter(x => x !== s) : [...prev.slots, s]
    }));
  };

  const openAdd = () => {
    setEditMed(null);
    setForm(EMPTY_MED);
    setShowModal(true);
  };

  const openEdit = (med) => {
    setEditMed(med);
    setForm({
      name:           med.name || '',
      dosage:         med.dosage || '',
      time:           Array.isArray(med.frequency) ? med.frequency[0] || '' : med.time || '',
      stock:          String(med.currentStock ?? med.stock ?? ''),
      startDate:      med.startDate ? med.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      slots:          med.slots || [],
      isMonthly:      med.isMonthly || false,
      prescriptionFile: null,
      reminderEmail:  med.reminderEmail || '',
      stockAlertLevel: med.stockAlertLevel ?? 10,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let prescriptionUrl = editMed?.prescriptionImage || '';

    if (form.prescriptionFile) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', form.prescriptionFile);
        const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        prescriptionUrl = uploadRes.data.url;
        toast.success('Prescription uploaded!');
      } catch {
        toast.error('Upload failed, saving without image.');
      }
      setIsUploading(false);
    }

    const payload = {
      name:             form.name,
      dosage:           form.dosage,
      frequency:        form.time ? [form.time] : [],
      slots:            form.slots,
      isMonthly:        form.isMonthly,
      currentStock:     Number(form.stock) || 0,
      startDate:        form.startDate,
      prescriptionImage: prescriptionUrl,
      reminderEmail:    form.reminderEmail,
      stockAlertLevel:  Number(form.stockAlertLevel) || 10,
    };

    try {
      if (editMed) {
        await api.put(`/medicines/${editMed._id}`, payload);
        toast.success('Medicine updated! ✅');
      } else {
        await api.post('/medicines', payload);
        toast.success('Medicine saved! 💊');
      }
      setShowModal(false);
      setForm(EMPTY_MED);
      setEditMed(null);
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medicine.');
    }
  };

  const deleteMed = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    await api.delete(`/medicines/${id}`);
    fetchMedicines();
    toast.success('Medicine removed.');
  };

  const handleRequestRefill = (med) => {
    toast.error(`Please select a pharmacy for ${med.name} on the 'Shops' or 'My Orders' page first.`, {
      icon: '🛒',
      duration: 4000
    });
  };

  const sendStockAlert = async (med) => {
    try {
      await api.post(`/medicines/${med._id}/stock-alert`);
      toast.success(`📧 Stock alert sent to ${med.reminderEmail || 'your email'}!`);
    } catch {
      toast.error('Could not send stock alert email.');
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>My Medicines</h1>
          <p style={{ color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>Track your medications, dosage, and stock levels</p>
        </div>
        <button className="btn-premium" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Medicine Cards */}
      {medicines.length === 0 ? (
        <div className="card-premium" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Pill size={48} style={{ color: '#c7d2fe', margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#475569', fontSize: '1.25rem' }}>No medicines added yet</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Click "Add Medicine" to start tracking your medications.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {medicines.map((med) => {
            const stock    = med.currentStock ?? med.stock ?? 0;
            const lowStock = stock <= (med.stockAlertLevel ?? 10);
            const timeLabel =
              (med.slots?.length > 0 ? med.slots.join(', ') : null) ||
              med.time ||
              (Array.isArray(med.frequency) && med.frequency.length ? med.frequency.join(', ') : null) ||
              '—';

            return (
              <div key={med._id} className="card-premium" style={{ padding: '1.5rem', borderLeft: lowStock ? '4px solid #fca5a5' : '4px solid transparent' }}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, background: '#eef2ff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={22} style={{ color: '#4f46e5' }} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{med.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{med.dosage}</p>
                    </div>
                  </div>
                  {/* Edit + Delete buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(med)} title="Edit"
                      style={{ padding: '6px', borderRadius: '8px', border: '1.5px solid #e8eaf6', background: 'white', cursor: 'pointer', color: '#4f46e5' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteMed(med._id)} title="Delete"
                      style={{ padding: '6px', borderRadius: '8px', border: '1.5px solid #fecaca', background: 'white', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {timeLabel}
                  </span>
                  {med.isMonthly && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: '#eef2ff', color: '#4f46e5' }}>Monthly</span>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: lowStock ? '#fef2f2' : '#f0fdf4', color: lowStock ? '#ef4444' : '#16a34a' }}>
                    Stock: {stock} {lowStock ? '⚠️ Low' : ''}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {lowStock && med.reminderEmail && (
                    <button onClick={() => sendStockAlert(med)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      <Bell size={13} /> Send Alert
                    </button>
                  )}
                  {lowStock && (
                    <button onClick={() => handleRequestRefill(med)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '10px', border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      <ShoppingCart size={13} /> Request Refill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', maxWidth: 460, width: '100%', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ width: 36, height: 36, background: '#eef2ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={18} style={{ color: '#4f46e5' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {editMed ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{editMed ? `Editing: ${editMed.name}` : 'Fill in medication details'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Name & Dosage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Medicine Name *</label>
                  <input required className="input-premium" placeholder="e.g. Paracetamol" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Dosage *</label>
                  <input required className="input-premium" placeholder="e.g. 500mg" value={form.dosage}
                    onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
                </div>
              </div>

              {/* Slots */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>Frequency</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {SLOTS.map(s => (
                    <button key={s.label} type="button" onClick={() => toggleSlot(s.label)}
                      style={{ padding: '0.5rem 0.25rem', borderRadius: '0.75rem', border: form.slots.includes(s.label) ? '2px solid #4f46e5' : '1.5px solid #e8eaf6', background: form.slots.includes(s.label) ? '#4f46e5' : 'white', color: form.slots.includes(s.label) ? 'white' : '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      {s.label}<br /><span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{s.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom time / Start date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Custom Reminder Time</label>
                  <input type="time" className="input-premium" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Start Date *</label>
                  <input type="date" required className="input-premium" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
              </div>

              {/* Stock & Alert Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Current Stock *</label>
                  <input type="number" required min="0" className="input-premium" placeholder="e.g. 30" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Low Stock Alert At</label>
                  <input type="number" min="1" className="input-premium" placeholder="e.g. 10" value={form.stockAlertLevel}
                    onChange={e => setForm(f => ({ ...f, stockAlertLevel: e.target.value }))} />
                </div>
              </div>

              {/* Email reminder */}
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>📧 Email for Reminders (optional)</label>
                <input type="email" className="input-premium" style={{ padding: '0.5rem 0.75rem' }} placeholder="your@gmail.com" value={form.reminderEmail}
                  onChange={e => setForm(f => ({ ...f, reminderEmail: e.target.value }))} />
              </div>

              {/* Monthly toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8faff', borderRadius: '0.75rem', border: '1.5px solid #e8eaf6' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>Monthly Treatment</p>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Auto-track for 30 days</p>
                </div>
                <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer" checked={form.isMonthly}
                  onChange={e => setForm(f => ({ ...f, isMonthly: e.target.checked }))} />
              </div>

              {/* Prescription upload */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                  <Upload size={13} /> Prescription (optional)
                </label>
                <input type="file" accept="image/*,.pdf"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  onChange={e => setForm(f => ({ ...f, prescriptionFile: e.target.files[0] }))} />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditMed(null); }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '0.75rem', border: '1.5px solid #e8eaf6', background: 'white', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn-premium" style={{ flex: 2, padding: '0.65rem' }}>
                  {isUploading ? 'Uploading…' : editMed ? '✅ Update' : '💊 Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;