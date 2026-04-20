import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ExternalLink } from 'lucide-react';
import { hasCoords, googleMapsOpenUrl } from '../lib/maps';
import 'leaflet/dist/leaflet.css';

// ── Google-style red pin marker (SVG, no external image needed) ──────────────
const redPinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ff5252"/>
      <stop offset="100%" stop-color="#c62828"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <!-- Pin body -->
    <path d="M16 2C9.37 2 4 7.37 4 14c0 9.75 12 30 12 30s12-20.25 12-30C28 7.37 22.63 2 16 2z" fill="url(#bg)"/>
    <!-- White circle inner -->
    <circle cx="16" cy="14" r="6" fill="white" opacity="0.95"/>
    <!-- Inner dot -->
    <circle cx="16" cy="14" r="2.5" fill="#c62828"/>
  </g>
</svg>
`;

const redPinIcon = L.divIcon({
  html: redPinSvg,
  className: '',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -50],
});

const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView(INDIA_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, points]);
  return null;
}

const isOpen = (hoursStr) => {
  if (!hoursStr || hoursStr === '24/7') return true;
  const currentHour = new Date().getHours();
  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) return currentHour >= 8 && currentHour < 22;
  return currentHour >= parseInt(match[1]) && currentHour < parseInt(match[3]);
};

export default function ShopsMap({ shops }) {
  const withCoords = useMemo(() => (shops || []).filter(hasCoords), [shops]);
  const points = useMemo(
    () => withCoords.map((s) => [s.latitude, s.longitude]),
    [withCoords]
  );

  if (withCoords.length === 0) {
    return (
      <div style={{
        borderRadius: '1.25rem', border: '1.5px solid #e8eaf6', background: '#f8faff',
        padding: '3rem 2rem', textAlign: 'center', color: '#64748b'
      }}>
        <MapPin size={36} style={{ margin: '0 auto 0.75rem', color: '#c7d2fe' }} />
        <p style={{ fontWeight: 700, color: '#475569' }}>No map locations yet</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Shop owners need to set coordinates in Shop Settings to appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1.5px solid #e8eaf6', boxShadow: '0 4px 20px rgba(79,70,229,0.08)' }}>
      {/* Map header bar */}
      <div style={{
        padding: '0.875rem 1.25rem', background: 'white',
        borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        <MapPin size={16} style={{ color: '#c62828' }} />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
          {withCoords.length} shop{withCoords.length !== 1 ? 's' : ''} on map
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
          Click a pin for details
        </span>
      </div>

      {/* Map container */}
      <div style={{ height: 'min(460px, 58vh)', width: '100%', position: 'relative' }}>
        <MapContainer
          center={points[0] || INDIA_CENTER}
          zoom={withCoords.length === 1 ? 14 : DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          {/* Google Maps-style tile layer (Esri World Street Map) */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, USGS, NGA, EPA, NPS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />

          <FitBounds points={points} />

          {withCoords.map((shop) => {
            const open = isOpen(shop.operatingHours);
            const rating = Number(shop.rating || 0).toFixed(1);

            return (
              <Marker key={shop._id} position={[shop.latitude, shop.longitude]} icon={redPinIcon}>
                <Popup
                  minWidth={240}
                  maxWidth={280}
                  className="gmaps-popup"
                >
                  {/* City Pharmacy-style popup */}
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px 0' }}>
                    {/* Shop name */}
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '4px', lineHeight: 1.3 }}>
                      {shop.name}
                    </p>

                    {/* Rating + status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#92400e' }}>{rating}</span>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                        borderRadius: '999px',
                        background: open ? '#dcfce7' : '#f1f5f9',
                        color: open ? '#15803d' : '#94a3b8'
                      }}>
                        {open ? '● Open Now' : '○ Closed'}
                      </span>
                    </div>

                    {/* Address */}
                    {shop.address && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <MapPin size={12} style={{ flexShrink: 0, marginTop: 2, color: '#94a3b8' }} />
                        {shop.address}
                      </p>
                    )}

                    {/* Hours */}
                    {shop.operatingHours && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#94a3b8' }} />
                        {shop.operatingHours}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <a
                        href={googleMapsOpenUrl(shop)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                          background: '#f8faff', color: '#4f46e5', border: '1px solid #e8eaf6', textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={11} /> Google Maps
                      </a>
                      <Link
                        to={`/shops/${shop._id}`}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                          background: '#4f46e5', color: 'white', textDecoration: 'none'
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.625rem 1rem', background: 'white', borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          Map © <a href="https://www.esri.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>Esri</a>
        </span>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          Click <span style={{ color: '#c62828', fontWeight: 700 }}>●</span> pins to explore shops
        </span>
      </div>

      {/* Popup styling override */}
      <style>{`
        .gmaps-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
          border: 1.5px solid #e8eaf6 !important;
          padding: 0 !important;
        }
        .gmaps-popup .leaflet-popup-content {
          margin: 14px 16px !important;
          line-height: 1.4 !important;
        }
        .gmaps-popup .leaflet-popup-tip {
          background: white !important;
          box-shadow: none !important;
        }
        .leaflet-popup-close-button {
          top: 10px !important;
          right: 10px !important;
          font-size: 18px !important;
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
}
