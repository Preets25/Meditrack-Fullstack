import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, Building2, Search, X, Filter } from 'lucide-react';
import ShopsMap from '../components/ShopsMap';

const CITIES = ['All Cities'];

const isOpen = (hoursStr) => {
  if (!hoursStr || hoursStr === '24/7') return true;
  const currentHour = new Date().getHours();
  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) return currentHour >= 8 && currentHour < 22;
  const openH  = parseInt(match[1]);
  const closeH = parseInt(match[3]);
  return currentHour >= openH && currentHour < closeH;
};

const StarRating = ({ rating }) => (
  <div className="shops-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '14px' }}>★</span>
    ))}
    <span className="shops-rating-num">{Number(rating).toFixed(1)}</span>
  </div>
);

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/shops');
        setShops(res.data.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derive unique cities from shops
  const cities = useMemo(() => {
    const cs = [...new Set(shops.map(s => s.city).filter(Boolean))].sort();
    return ['All Cities', ...cs];
  }, [shops]);

  // Filtered shops
  const filtered = useMemo(() => shops.filter(shop => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      shop.name.toLowerCase().includes(q) ||
      (shop.address || '').toLowerCase().includes(q) ||
      (shop.city || '').toLowerCase().includes(q);
    const matchCity = cityFilter === 'All Cities' || shop.city === cityFilter;
    const open = isOpen(shop.operatingHours);
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Open' ? open : !open);
    return matchSearch && matchCity && matchStatus;
  }), [shops, search, cityFilter, statusFilter]);

  if (loading) {
    return (
      <div className="shops-loading">
        <div className="shops-spinner" />
        <p>Loading chemist shops…</p>
      </div>
    );
  }

  return (
    <div className="shops-root">
      {/* Hero header */}
      <div className="shops-hero">
        <div>
          <h1 className="shops-hero-title">Chemist Directory</h1>
          <p className="shops-hero-sub">Find trusted medical shops & pharmacies across India</p>
        </div>
        <div className="shops-hero-stats">
          <div className="shops-hero-stat">
            <span className="shops-hero-stat-num">{shops.length}</span>
            <span className="shops-hero-stat-lbl">Shops Listed</span>
          </div>
          <div className="shops-hero-stat">
            <span className="shops-hero-stat-num">{shops.filter(s => isOpen(s.operatingHours)).length}</span>
            <span className="shops-hero-stat-lbl">Open Now</span>
          </div>
          <div className="shops-hero-stat">
            <span className="shops-hero-stat-num">{cities.length - 1}</span>
            <span className="shops-hero-stat-lbl">Cities</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="shops-map-section">
        <h2 className="shops-section-title">
          <MapPin size={20} className="text-indigo-600" /> Shops on India Map
        </h2>
        <ShopsMap shops={shops} />
      </div>

      {/* Filters */}
      <div className="shops-filters">
        <div className="shops-search">
          <Search size={16} className="shops-search-icon" />
          <input
            type="text"
            placeholder="Search by shop name, area or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="shops-search-input"
          />
          {search && <button onClick={() => setSearch('')} className="shops-search-clear"><X size={14} /></button>}
        </div>
        <div className="shops-filter-row">
          <Filter size={15} className="text-slate-400 flex-shrink-0" />
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="shops-select">
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          {['All', 'Open', 'Closed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shops-status-btn ${statusFilter === s ? 'shops-status-active' : ''}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="shops-results-header">
        <span className="shops-results-count">{filtered.length} shop{filtered.length !== 1 ? 's' : ''} found</span>
        {(search || cityFilter !== 'All Cities' || statusFilter !== 'All') && (
          <button onClick={() => { setSearch(''); setCityFilter('All Cities'); setStatusFilter('All'); }} className="shops-clear-btn">
            Clear filters
          </button>
        )}
      </div>

      {/* Shop Cards Grid */}
      {filtered.length === 0 ? (
        <div className="shops-empty">
          <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No shops found</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="shops-grid">
          {filtered.map(shop => {
            const open = isOpen(shop.operatingHours);
            return (
              <div key={shop._id} className={`shops-card ${!open ? 'shops-card-closed' : ''}`}>
                <div className="shops-card-top">
                  <div className="shops-card-icon">
                    <Building2 size={22} />
                  </div>
                  <span className={`shops-badge ${open ? 'shops-badge-open' : 'shops-badge-closed'}`}>
                    {open ? '● Open' : '○ Closed'}
                  </span>
                </div>

                <h3 className="shops-card-name">{shop.name}</h3>

                {shop.city && (
                  <span className="shops-city-tag">{shop.city}</span>
                )}

                <div className="shops-card-info">
                  <div className="shops-info-row">
                    <MapPin size={13} />
                    <span>{shop.address}</span>
                  </div>
                  {shop.phone && (
                    <div className="shops-info-row">
                      <Phone size={13} />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  <div className="shops-info-row">
                    <Clock size={13} />
                    <span>{shop.operatingHours}</span>
                  </div>
                </div>

                <div className="shops-card-footer">
                  <StarRating rating={shop.rating || 0} />
                  <Link to={`/shops/${shop._id}`} className="shops-view-btn">
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .shops-root { padding:2rem; background:#f8fafc; min-height:100vh; }
        .shops-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:1rem; color:#64748b; }
        .shops-spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#6366f1; border-radius:50%; animation:shops-spin .8s linear infinite; }
        @keyframes shops-spin { to { transform:rotate(360deg); } }

        .shops-hero { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.5rem; margin-bottom:2rem; }
        .shops-hero-title { font-size:2rem; font-weight:900; background:linear-gradient(135deg,#4338ca,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-0.5px; }
        .shops-hero-sub { color:#64748b; margin-top:0.25rem; font-size:1rem; }
        .shops-hero-stats { display:flex; gap:1.5rem; }
        .shops-hero-stat { text-align:center; }
        .shops-hero-stat-num { display:block; font-size:1.75rem; font-weight:900; color:#4338ca; }
        .shops-hero-stat-lbl { font-size:0.75rem; color:#94a3b8; font-weight:500; }

        .shops-map-section { margin-bottom:2rem; }
        .shops-section-title { display:flex; align-items:center; gap:0.5rem; font-size:1.1rem; font-weight:700; color:#1e293b; margin-bottom:0.75rem; }

        .shops-filters { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
        .shops-search { position:relative; flex:1; max-width:400px; }
        .shops-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .shops-search-input { width:100%; padding:0.65rem 0.75rem 0.65rem 2.25rem; border:1.5px solid #e2e8f0; border-radius:12px; font-size:0.9rem; outline:none; background:white; transition:border-color .2s; }
        .shops-search-input:focus { border-color:#6366f1; }
        .shops-search-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; display:flex; align-items:center; }
        .shops-filter-row { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
        .shops-select { padding:0.6rem 0.9rem; border:1.5px solid #e2e8f0; border-radius:10px; background:white; font-size:0.85rem; font-weight:600; color:#475569; outline:none; cursor:pointer; }
        .shops-select:focus { border-color:#6366f1; }
        .shops-status-btn { padding:0.45rem 1rem; border-radius:20px; border:1.5px solid #e2e8f0; background:white; font-size:0.8rem; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
        .shops-status-btn:hover { border-color:#6366f1; color:#6366f1; }
        .shops-status-active { background:#6366f1; border-color:#6366f1; color:white !important; }

        .shops-results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
        .shops-results-count { font-size:0.875rem; font-weight:600; color:#64748b; }
        .shops-clear-btn { font-size:0.8rem; color:#6366f1; font-weight:600; background:none; border:none; cursor:pointer; text-decoration:underline; }

        .shops-empty { text-align:center; padding:4rem 2rem; background:white; border-radius:16px; border:1px solid #e2e8f0; color:#64748b; }

        .shops-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; }
        .shops-card { background:white; border-radius:18px; padding:1.4rem; border:1.5px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,.04); transition:all .2s; display:flex; flex-direction:column; gap:0.75rem; }
        .shops-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.12); border-color:#c4b5fd; }
        .shops-card-closed { opacity:.78; }

        .shops-card-top { display:flex; align-items:center; justify-content:space-between; }
        .shops-card-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#ede9fe,#c4b5fd); display:flex; align-items:center; justify-content:center; color:#6d28d9; }
        .shops-badge { font-size:0.72rem; font-weight:700; padding:0.3rem 0.75rem; border-radius:20px; }
        .shops-badge-open   { background:#dcfce7; color:#15803d; }
        .shops-badge-closed { background:#f1f5f9; color:#94a3b8; }

        .shops-card-name { font-size:1rem; font-weight:800; color:#0f172a; line-height:1.3; }
        .shops-city-tag { display:inline-block; padding:0.2rem 0.65rem; background:#ede9fe; color:#6d28d9; border-radius:20px; font-size:0.72rem; font-weight:700; }

        .shops-card-info { display:flex; flex-direction:column; gap:0.45rem; flex:1; }
        .shops-info-row { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.8rem; color:#64748b; }
        .shops-info-row svg { flex-shrink:0; margin-top:1px; color:#94a3b8; }

        .shops-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:0.75rem; border-top:1px solid #f1f5f9; margin-top:auto; }
        .shops-stars { display:flex; align-items:center; gap:1px; }
        .shops-rating-num { font-size:0.8rem; font-weight:700; color:#64748b; margin-left:4px; }
        .shops-view-btn { font-size:0.8rem; font-weight:700; color:#6366f1; text-decoration:none; transition:color .15s; }
        .shops-view-btn:hover { color:#4338ca; }

        @media(max-width:640px){
          .shops-root { padding:1rem; }
          .shops-hero { flex-direction:column; align-items:flex-start; }
          .shops-hero-stats { gap:1rem; }
        }
      `}</style>
    </div>
  );
};

export default Shops;
