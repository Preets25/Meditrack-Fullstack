import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pill, Trash2, Calendar, ShoppingCart, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '', dosage: '', time: '', stock: '',
    startDate: new Date().toISOString().split('T')[0],
    slots: [], isMonthly: false,
    prescriptionFile: null
  });
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

  const SLOTS = [
    { label: 'Morning', time: '08:00 AM' },
    { label: 'Afternoon', time: '02:00 PM' },
    { label: 'Evening', time: '06:00 PM' },
    { label: 'Night', time: '09:00 PM' }
  ];

  const toggleSlot = (s) => {
    setNewMed(prev => ({
      ...prev,
      slots: prev.slots.includes(s)
        ? prev.slots.filter(x => x !== s)
        : [...prev.slots, s]
    }));
  };

  const handleAddMed = async (e) => {
    e.preventDefault();

    let prescriptionUrl = '';

    if (newMed.prescriptionFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', newMed.prescriptionFile);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        prescriptionUrl = uploadRes.data.url;
        toast.success('Prescription uploaded successfully!');
      } catch (err) {
        toast.error('Image upload failed, saving without image.');
      }
      setIsUploading(false);
    }

    await api.post('/medicines', {
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.time ? [newMed.time] : [],
      slots: newMed.slots,
      isMonthly: newMed.isMonthly,
      currentStock: Number(newMed.stock) || 0,
      startDate: newMed.startDate,
      prescriptionImage: prescriptionUrl
    });

    setShowModal(false);
    setNewMed({ name: '', dosage: '', time: '', stock: '', startDate: new Date().toISOString().split('T')[0], slots: [], isMonthly: false, prescriptionFile: null });
    fetchMedicines();
    toast.success('Medicine saved!');
  };

  const deleteMed = async (id) => {
    if (window.confirm("Delete this medicine?")) {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    }
  };

  const handleRequestRefill = async (med) => {
    // Basic implementation for Feature 1 - in real scenario, patient selects a shop.
    // For now, we are creating a generic order that a shop can pick up, or defaulting to MOCK_SHOPS[0]
    try {
      await api.post('/orders', {
        shopId: '60d5ecb8b392cb26dc2d8a5f', // Using a placeholder ObjectId or actual Shop ID from context
        medicineId: med._id,
        medicineName: med.name,
        quantity: 1
      });
      toast.success(`Refill requested for ${med.name}!`, { icon: '🛒' });
    } catch (err) {
      toast.error('Failed to request refill.');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Medicines</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} /> Add Medicine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.map((med) => {
          const stock = med.currentStock ?? med.stock ?? 0;
          const timeLabel =
            (med.slots && med.slots.length > 0 ? med.slots.join(', ') : null) ||
            med.time ||
            (Array.isArray(med.frequency) && med.frequency.length ? med.frequency.join(', ') : null) ||
            '—';
          return (
            <div key={med._id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative group hover:shadow-md transition cursor-default">
              <button onClick={() => deleteMed(med._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition">
                <Trash2 size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{med.name}</h3>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                  {med.isMonthly && <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Monthly</span>}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-medium">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Calendar size={14} /> {timeLabel}
                    </span>
                    {med.startDate && (
                      <span className="flex items-center gap-1 text-slate-500">
                        • {new Date(med.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full ${stock < 10 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                      Stock: {stock}
                    </span>
                  </div>
                  {stock < 10 && (
                    <button onClick={() => handleRequestRefill(med)} className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition">
                      <ShoppingCart size={14} /> Request Refill from Local Shop
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-2 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Medicine</h2>
            <form onSubmit={handleAddMed} className="space-y-3">
              <div className="space-y-2">
                <input type="text" placeholder="Medicine Name" className="w-full p-2.5 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" required
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} />
                <input type="text" placeholder="Dosage (e.g. 1 Tablet)" className="w-full p-2.5 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" required
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Frequency</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SLOTS.map(s => (
                    <button
                      key={s.label} type="button"
                      onClick={() => toggleSlot(s.label)}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg border-2 transition ${newMed.slots.includes(s.label) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className={`text-[9px] ${newMed.slots.includes(s.label) ? 'text-blue-100' : 'text-slate-400'}`}>{s.time}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold ml-1">Custom Time</label>
                    <input type="time" className="p-2 bg-slate-50 border-slate-200 border rounded-lg text-sm outline-none"
                      onChange={(e) => setNewMed({ ...newMed, time: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold ml-1">Start Date</label>
                    <input type="date" className="p-2 bg-slate-50 border-slate-200 border rounded-lg text-sm outline-none" required
                      value={newMed.startDate}
                      onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-indigo-900">Monthly Treatment</span>
                  <span className="text-[10px] text-indigo-600">Auto-track for 30 days</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  checked={newMed.isMonthly}
                  onChange={(e) => setNewMed({ ...newMed, isMonthly: e.target.checked })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Current Stock</label>
                <input type="number" placeholder="Total units (e.g. 30)" className="w-full p-2.5 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required
                  onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1"><Upload size={14} /> Prescription Upload (Optional)</label>
                <input type="file" accept="image/*,.pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  onChange={(e) => setNewMed({ ...newMed, prescriptionFile: e.target.files[0] })} />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 font-bold text-slate-500 text-sm hover:bg-slate-50 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isUploading} className={`flex-1 py-2.5 text-white font-bold text-sm rounded-xl transition ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}>
                  {isUploading ? 'Uploading...' : 'Save'}
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