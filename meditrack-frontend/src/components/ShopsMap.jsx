import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { hasCoords, googleMapsOpenUrl } from '../lib/maps';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

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
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, points]);
  return null;
}

/**
 * @param {{ shops: Array<{ _id: string, name: string, address?: string, latitude?: number, longitude?: number }> }} props
 */
export default function ShopsMap({ shops }) {
  const withCoords = useMemo(() => (shops || []).filter(hasCoords), [shops]);
  const points = useMemo(
    () => withCoords.map((s) => [s.latitude, s.longitude]),
    [withCoords]
  );

  if (withCoords.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-8 text-center text-slate-600">
        <MapPin className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="font-medium text-slate-700">No map locations yet</p>
        <p className="mt-1 text-sm">Shops need latitude and longitude to appear on the map.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="h-[min(420px,55vh)] w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:z-0">
        <MapContainer
          center={points[0] || INDIA_CENTER}
          zoom={withCoords.length === 1 ? 13 : DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {withCoords.map((shop) => (
            <Marker key={shop._id} position={[shop.latitude, shop.longitude]}>
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-slate-900">{shop.name}</p>
                  {shop.address && <p className="mt-1 text-xs text-slate-600">{shop.address}</p>}
                  <div className="mt-2 flex flex-col gap-1 text-xs">
                    <a
                      href={googleMapsOpenUrl(shop)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Open in Google Maps
                    </a>
                    <Link to={`/shops/${shop._id}`} className="text-indigo-600 underline">
                      View details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="border-t border-slate-100 bg-white px-4 py-2 text-center text-xs text-slate-500">
        Map data &copy;{' '}
        <a href="https://www.openstreetmap.org/copyright" className="text-indigo-600 underline" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{' '}
        contributors. Directions open in Google Maps.
      </p>
    </div>
  );
}
