import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Store, Clock, Phone, MapPin, User, Plus, Trash2,
  Save, CheckCircle, XCircle, ChevronRight, Settings,
  Navigation, Stethoscope, Info, AlertTriangle, Search, Link as LinkIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Components ──────────────────────────────────────────────────
const MapEventsHandler = ({ onMapClick, center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center]);
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ── helpers ─────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'ENT Specialist', 'Ophthalmologist',
  'Neurologist', 'Psychiatrist', 'Diabetologist', 'Pulmonologist', 'Other'
];
const TABS = [
  { id: 'profile', label: 'Shop Profile', icon: Store },
  { id: 'hours',   label: 'Hours & Location', icon: Clock },
];

const EMPTY_DOCTOR = { doctorName: '', specialization: 'General Physician', days: [], availableDates: '', timings: '' };

const ShopSettings = () => {
  const [tab, setTab] = useState('profile');
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasShop, setHasShop] = useState(true);

  // ── form state ──
  const [profile, setProfile] = useState({
    name: '', phone: '', description: '', licenseNumber: '', gstNumber: ''
  });
  const [location, setLocation] = useState({
    address: '', city: '', state: '', pincode: '',
    operatingHours: '09:00 - 21:00', openOn: 'Mon–Sat', latitude: '', longitude: ''
  });

  // ── fetch my shop ──
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/shops/my');
        const shop = res.data?.data;
        if (shop) {
          setShopId(shop._id);
          setProfile({
            name: shop.name || '',
            phone: shop.phone || '',
            description: shop.description || '',
            licenseNumber: shop.licenseNumber || '',
            gstNumber: shop.gstNumber || ''
          });
          setLocation({
            address: shop.address || '',
            city: shop.city || '',
            state: shop.state || '',
            pincode: shop.pincode || '',
            operatingHours: shop.operatingHours || '09:00 - 21:00',
            openOn: shop.openOn || 'Mon–Sat',
            latitude: shop.latitude ?? '',
            longitude: shop.longitude ?? ''
          });
          setHasShop(true);
        } else {
          setHasShop(false);
        }
      } catch {
        // No shop registered yet
        setHasShop(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── save shop ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name) return;
    setSaving(true);
    const payload = {
      ...profile,
      ...location,
      latitude: location.latitude !== '' ? Number(location.latitude) : undefined,
      longitude: location.longitude !== '' ? Number(location.longitude) : undefined,
    };
    try {
      if (hasShop && shopId) {
        const res = await api.put(`/shops/${shopId}`, payload);
        const updated = res.data?.data;
        if (updated) {
          setShopId(updated._id);
          setDoctors(updated.doctorSchedule || doctors);
        }
        showToast('Shop settings saved!');
      } else {
        const res = await api.post('/shops', payload);
        const created = res.data?.data;
        if (created) { 
          setShopId(created._id); 
          setHasShop(true); 
          showToast('Shop registered and account upgraded! ✨');
          // Reload only once to firmly apply the new Role across the app
          setTimeout(() => { window.location.reload(); }, 1500);
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to save settings. Check required fields.';
      showToast(errorMsg, 'error');
    }
    setSaving(false);
  };

  // ── doctor helpers ──
  const toggleDay = (day) => {
    setNewDoctor(d => ({
      ...d,
      days: d.days.includes(day) ? d.days.filter(x => x !== day) : [...d.days, day]
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'MediTrack-App' }
      });
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        setLocation(l => ({
          ...l,
          latitude: lat,
          longitude: lng,
          city: addr.city || addr.town || addr.village || l.city,
          state: addr.state || l.state,
          pincode: addr.postcode || l.pincode,
          address: data.display_name || l.address
        }));
        showToast('Address details auto-filled!');
      } else {
        setLocation(l => ({ ...l, latitude: lat, longitude: lng }));
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setLocation(l => ({ ...l, latitude: lat, longitude: lng }));
    }
  };

  const handleAddressSearch = async (query) => {
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'MediTrack-App' }
      });
      const results = await res.json();
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        reverseGeocode(parseFloat(lat), parseFloat(lon));
      } else {
        showToast('Address not found', 'error');
      }
    } catch (err) {
      showToast('Search failed', 'error');
    }
  };


  if (loading) {
    return (
      <div className="ss-loading">
        <div className="ss-spinner" />
        <p>Loading shop settings…</p>
      </div>
    );
  }

  return (
    <div className="ss-root">
      {/* Toast */}
      {toast && (
        <div className={`ss-toast ${toast.type === 'error' ? 'ss-toast-error' : 'ss-toast-success'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="ss-header">
        <div>
          <h1 className="ss-title">Shop Settings</h1>
          <p className="ss-subtitle">
            {hasShop ? 'Manage your chemist\'s public listing and schedule' : 'Register your chemist shop on Meditrack'}
          </p>
        </div>
        <button className="ss-btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={17} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {!hasShop && (
        <div className="ss-notice">
          <AlertTriangle size={18} />
          <p>You haven't registered a shop yet. Fill in the details below and click <strong>Save Changes</strong> to list your chemist.</p>
        </div>
      )}

      <div className="ss-layout">
        {/* Sidebar Tabs */}
        <nav className="ss-sidebar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`ss-tab ${tab === t.id ? 'ss-tab-active' : ''}`}
            >
              <t.icon size={18} />
              {t.label}
              <ChevronRight size={16} className="ss-tab-chevron" />
            </button>
          ))}
        </nav>

        {/* Content */}
        <form onSubmit={handleSave} className="ss-content">

          {/* ── Profile Tab ── */}
          {tab === 'profile' && (
            <div className="ss-card">
              <div className="ss-card-header">
                <Store size={20} />
                <h2>Shop Profile</h2>
              </div>
              <div className="ss-form-grid">
                <div className="ss-field ss-col-2">
                  <label>Shop Name *</label>
                  <input
                    required value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Apollo Pharmacy — Connaught Place"
                  />
                </div>
                <div className="ss-field">
                  <label>Phone Number</label>
                  <div className="ss-input-icon">
                    <Phone size={15} />
                    <input
                      type="tel" value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="ss-field">
                  <label>Drug License Number</label>
                  <input
                    value={profile.licenseNumber}
                    onChange={e => setProfile(p => ({ ...p, licenseNumber: e.target.value }))}
                    placeholder="e.g. DL-MH-654321"
                  />
                </div>
                <div className="ss-field">
                  <label>GST Number</label>
                  <input
                    value={profile.gstNumber}
                    onChange={e => setProfile(p => ({ ...p, gstNumber: e.target.value }))}
                    placeholder="e.g. 27AABCU9603R1ZM"
                  />
                </div>
                <div className="ss-field ss-col-2">
                  <label>Shop Description</label>
                  <textarea
                    rows={4} value={profile.description}
                    onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your shop, specialities, services offered…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Hours & Location Tab ── */}
          {tab === 'hours' && (
            <div className="ss-card">
              <div className="ss-card-header">
                <Clock size={20} />
                <h2>Hours &amp; Location</h2>
              </div>
              <div className="ss-form-grid">
                <div className="ss-field ss-col-2">
                  <label>Full Address *</label>
                  <div className="ss-input-icon">
                    <MapPin size={15} />
                    <input
                      required
                      value={location.address}
                      onChange={e => setLocation(l => ({ ...l, address: e.target.value }))}
                      placeholder="Street, Locality, Area…"
                    />
                  </div>
                </div>
                <div className="ss-field">
                  <label>City</label>
                  <input
                    value={location.city}
                    onChange={e => setLocation(l => ({ ...l, city: e.target.value }))}
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div className="ss-field">
                  <label>State</label>
                  <input
                    value={location.state}
                    onChange={e => setLocation(l => ({ ...l, state: e.target.value }))}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div className="ss-field">
                  <label>PIN Code</label>
                  <input
                    value={location.pincode}
                    onChange={e => setLocation(l => ({ ...l, pincode: e.target.value }))}
                    placeholder="e.g. 400001"
                  />
                </div>
                <div className="ss-field">
                  <label>Operating Hours</label>
                  <div className="ss-input-icon">
                    <Clock size={15} />
                    <input
                      value={location.operatingHours}
                      onChange={e => setLocation(l => ({ ...l, operatingHours: e.target.value }))}
                      placeholder="09:00 - 21:00  or  24/7"
                    />
                  </div>
                </div>
                <div className="ss-field">
                  <label>Open On</label>
                  <input
                    value={location.openOn}
                    onChange={e => setLocation(l => ({ ...l, openOn: e.target.value }))}
                    placeholder="e.g. Mon–Sat  or  All days"
                  />
                </div>

                <div className="ss-divider ss-col-2">
                  <Navigation size={16} />
                  <span>Map Location Integration</span>
                </div>

                <div className="ss-field ss-col-2">
                  <label>Quick Location (Paste Google Maps Link)</label>
                  <div className="ss-input-icon">
                    <LinkIcon size={15} />
                    <input
                      placeholder="Paste link from Google Maps (e.g. google.com/maps/@19.07,72.87...)"
                      onChange={(e) => {
                        const url = e.target.value;
                        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
                        const match = url.match(regex);
                        if (match) {
                          const lat = parseFloat(match[1]);
                          const lng = parseFloat(match[2]);
                          reverseGeocode(lat, lng);
                        }
                      }}
                    />
                  </div>
                  <p className="ss-tip mt-1">
                    <Info size={12} />
                    Copy the URL from Google Maps and paste it here to automatically set your location.
                  </p>
                </div>

                {/* Interactive Map */}
                <div className="ss-field ss-col-2">
                  <label>Search Address or Interactive Map (Click to drop pin)</label>
                  <div className="ss-search-wrap mb-2">
                    <div className="ss-input-icon">
                      <Search size={15} />
                      <input 
                        placeholder="Search for a location (e.g. Pune, Maharashtra)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddressSearch(e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="ss-map-container">
                    <MapContainer 
                      center={[location.latitude || 19.0760, location.longitude || 72.8777]} 
                      zoom={13} 
                      className="ss-leaflet-map"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <MapEventsHandler 
                        center={location.latitude && location.longitude ? [location.latitude, location.longitude] : null}
                        onMapClick={(lat, lng) => reverseGeocode(lat, lng)}
                      />
                      {location.latitude && location.longitude && (
                        <Marker position={[location.latitude, location.longitude]} />
                      )}
                    </MapContainer>
                  </div>
                </div>

                <div className="ss-field">
                  <label>Latitude</label>
                  <input
                    type="number" step="any" value={location.latitude}
                    onChange={e => setLocation(l => ({ ...l, latitude: e.target.value }))}
                    placeholder="e.g. 19.0760"
                  />
                </div>
                <div className="ss-field">
                  <label>Longitude</label>
                  <input
                    type="number" step="any" value={location.longitude}
                    onChange={e => setLocation(l => ({ ...l, longitude: e.target.value }))}
                    placeholder="e.g. 72.8777"
                  />
                </div>
              </div>
            </div>
          )}


          {/* Save button (bottom / mobile) */}
          <div className="ss-save-bottom">
            <button type="submit" className="ss-btn-primary ss-btn-lg" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving changes…' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .ss-root { padding:2rem; background:#f8fafc; min-height:100vh; position:relative; }
        .ss-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:1rem; color:#64748b; }
        .ss-spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#6366f1; border-radius:50%; animation:ss-spin 0.8s linear infinite; }
        @keyframes ss-spin { to { transform:rotate(360deg); } }

        .ss-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
        .ss-title { font-size:1.75rem; font-weight:800; color:#0f172a; letter-spacing:-0.3px; }
        .ss-subtitle { color:#64748b; margin-top:0.25rem; }

        .ss-notice { display:flex; align-items:center; gap:0.75rem; padding:0.9rem 1.25rem; background:#fffbeb; border:1.5px solid #fde68a; border-radius:12px; color:#92400e; font-size:0.875rem; margin-bottom:1.5rem; }

        .ss-layout { display:grid; grid-template-columns:220px 1fr; gap:1.5rem; align-items:start; }

        .ss-sidebar { background:white; border-radius:16px; border:1px solid #e2e8f0; padding:0.75rem; display:flex; flex-direction:column; gap:0.25rem; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .ss-tab { display:flex; align-items:center; gap:0.65rem; padding:0.7rem 0.9rem; border-radius:10px; border:none; background:none; cursor:pointer; font-size:0.875rem; font-weight:500; color:#64748b; transition:all .15s; width:100%; text-align:left; }
        .ss-tab:hover { background:#f8fafc; color:#3730a3; }
        .ss-tab-active { background:linear-gradient(135deg,#ede9fe,#ddd6fe); color:#4c1d95; font-weight:700; }
        .ss-tab-chevron { margin-left:auto; opacity:0.4; }

        .ss-content { display:flex; flex-direction:column; gap:1.25rem; }
        .ss-card { background:white; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .ss-card-header { display:flex; align-items:center; gap:0.75rem; padding:1.1rem 1.5rem; border-bottom:1px solid #f1f5f9; font-size:1rem; font-weight:700; color:#1e293b; background:#fafbff; }

        .ss-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.1rem; padding:1.5rem; }
        .ss-field { display:flex; flex-direction:column; gap:0.35rem; }
        .ss-field label { font-size:0.8rem; font-weight:600; color:#475569; }
        .ss-field input, .ss-field select, .ss-field textarea { padding:0.65rem 0.85rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.875rem; outline:none; transition:border-color .2s; font-family:inherit; resize:vertical; }
        .ss-field input:focus, .ss-field select:focus, .ss-field textarea:focus { border-color:#6366f1; }
        .ss-input-icon { position:relative; }
        .ss-input-icon svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .ss-input-icon input { padding-left:2.25rem; width:100%; }
        .ss-col-2 { grid-column:span 2; }
        .ss-divider { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:600; color:#6366f1; padding:0.4rem 0; border-top:1px solid #f1f5f9; margin-top:0.25rem; }
        .ss-tip { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.78rem; color:#64748b; background:#f8fafc; padding:0.75rem 1rem; border-radius:8px; line-height:1.5; }

        .ss-doctor-form { padding:1.25rem 1.5rem; background:#fafbff; border-bottom:1px solid #f1f5f9; }
        .ss-days { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .ss-day-btn { padding:0.35rem 0.75rem; border-radius:20px; border:1.5px solid #e2e8f0; background:white; font-size:0.8rem; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
        .ss-day-btn:hover { border-color:#6366f1; color:#6366f1; }
        .ss-day-active { background:#6366f1; border-color:#6366f1; color:white !important; }
        .ss-doctor-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1rem; }

        .ss-doctors-list { padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:0.75rem; }
        .ss-doctor-card { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:#fafbff; border:1.5px solid #e2e8f0; border-radius:14px; transition:border-color .15s; }
        .ss-doctor-card:hover { border-color:#c4b5fd; }
        .ss-doctor-avatar { width:44px; height:44px; background:linear-gradient(135deg,#ede9fe,#c4b5fd); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#6d28d9; flex-shrink:0; }
        .ss-doctor-info { flex:1; }
        .ss-doctor-name { font-weight:700; color:#1e293b; font-size:0.9rem; }
        .ss-doctor-spec { font-size:0.78rem; color:#6366f1; font-weight:600; margin-top:1px; }
        .ss-doctor-meta { display:flex; align-items:center; gap:0.75rem; margin-top:0.4rem; }
        .ss-doctor-days { font-size:0.75rem; color:#64748b; background:#f1f5f9; padding:2px 10px; border-radius:20px; font-weight:500; }
        .ss-doctor-time { display:flex; align-items:center; gap:4px; font-size:0.75rem; color:#64748b; }
        .ss-del-btn { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:none; border-radius:8px; background:#fee2e2; color:#dc2626; cursor:pointer; transition:all .15s; flex-shrink:0; }
        .ss-del-btn:hover { background:#fecaca; }

        .ss-empty { text-align:center; padding:3rem 2rem; color:#64748b; }
        .ss-ml-auto { margin-left:auto; }

        .ss-save-bottom { display:flex; justify-content:flex-end; padding-top:0.5rem; }
        .ss-btn-lg { padding:0.8rem 1.75rem !important; font-size:0.95rem !important; }

        .ss-map-container { position:relative; width:100%; height:300px; border:2px solid #e2e8f0; border-radius:12px; overflow:hidden; z-index:1; }
        .ss-leaflet-map { width:100%; height:100%; }

        .ss-btn-primary { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.25rem; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border:none; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; transition:opacity .15s; white-space:nowrap; }
        .ss-btn-primary:hover { opacity:.9; }
        .ss-btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .ss-btn-ghost { padding:0.65rem 1.25rem; background:white; color:#64748b; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; transition:all .15s; }
        .ss-btn-ghost:hover { border-color:#cbd5e1; color:#1e293b; }

        .ss-toast { position:fixed; bottom:1.5rem; right:1.5rem; display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1.25rem; border-radius:12px; font-size:0.875rem; font-weight:600; z-index:2000; box-shadow:0 10px 25px rgba(0,0,0,.15); animation:ss-slideUp .3s ease; }
        .ss-toast-success { background:#0f172a; color:white; }
        .ss-toast-error   { background:#ef4444; color:white; }
        @keyframes ss-slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

        @media(max-width:768px){
          .ss-root { padding:1rem; }
          .ss-layout { grid-template-columns:1fr; }
          .ss-sidebar { flex-direction:row; overflow-x:auto; }
          .ss-tab { flex-direction:column; gap:0.25rem; font-size:0.75rem; padding:0.6rem; white-space:nowrap; }
          .ss-tab-chevron { display:none; }
          .ss-form-grid { grid-template-columns:1fr; }
          .ss-col-2 { grid-column:span 1; }
        }
      `}</style>
    </div>
  );
};

export default ShopSettings;
