import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;
const mapContainerStyle = { width: '100%', height: 'min(420px, 55vh)' };

function hasCoords(shop) {
  return (
    typeof shop?.latitude === 'number' &&
    typeof shop?.longitude === 'number' &&
    !Number.isNaN(shop.latitude) &&
    !Number.isNaN(shop.longitude)
  );
}

function GoogleShopsMapInner({ shops, apiKey }) {
  const [directions, setDirections] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dirStatus, setDirStatus] = useState('');
  const [userLoc, setUserLoc] = useState(null);

  const withCoords = useMemo(() => (shops || []).filter(hasCoords), [shops]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'meditrack-google-map',
    googleMapsApiKey: apiKey
  });

  const onMapLoad = useCallback(
    (map) => {
      if (!withCoords.length) {
        map.setCenter(INDIA_CENTER);
        map.setZoom(DEFAULT_ZOOM);
        return;
      }
      const bounds = new window.google.maps.LatLngBounds();
      withCoords.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      map.fitBounds(bounds, 48);
    },
    [withCoords]
  );

  const requestDirections = useCallback(
    (shop) => {
      if (!isLoaded || !shop || !hasCoords(shop)) return;
      setDirStatus('');
      setDirections(null);

      const run = (origin) => {
        const svc = new window.google.maps.DirectionsService();
        svc.route(
          {
            origin,
            destination: { lat: shop.latitude, lng: shop.longitude },
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === 'OK' && result) {
              setDirections(result);
              setDirStatus('');
            } else {
              setDirStatus(`Directions failed: ${status}`);
            }
          }
        );
      };

      if (userLoc) {
        run(userLoc);
        return;
      }
      if (!navigator.geolocation) {
        setDirStatus('Geolocation is not supported in this browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          run(loc);
        },
        () => setDirStatus('Allow location access to plot directions on the map.'),
        { enableHighAccuracy: true, timeout: 12000 }
      );
    },
    [isLoaded, userLoc]
  );

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 text-sm">
        Could not load Google Maps: {String(loadError.message || loadError)}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[min(420px,55vh)] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600">
        Loading map…
      </div>
    );
  }

  if (!withCoords.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-8 text-center text-slate-600">
        No shops with coordinates to show on the map.
      </div>
    );
  }

  const selected = withCoords.find((s) => s._id === selectedId);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {withCoords.map((shop) => (
          <Marker
            key={shop._id}
            position={{ lat: shop.latitude, lng: shop.longitude }}
            title={shop.name}
            onClick={() => {
              setSelectedId(shop._id);
              setDirections(null);
              setDirStatus('');
            }}
          />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      <div className="space-y-2 border-t border-slate-100 bg-white p-4">
        {selected ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="truncate text-sm text-slate-500">{selected.address}</p>
            </div>
            <button
              type="button"
              onClick={() => requestDirections(selected)}
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Get directions
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Tap a marker to select a shop, then use Get directions.</p>
        )}
        {dirStatus && <p className="text-sm text-rose-600">{dirStatus}</p>}
      </div>
    </div>
  );
}

/**
 * Embedded Google Map: shops as markers, driving directions from user location on demand.
 * Requires VITE_GOOGLE_MAPS_API_KEY and Directions API + Maps JavaScript API enabled in Google Cloud.
 */
export default function GoogleShopsMap({ shops = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 text-sm">
        <p className="font-semibold">Google Maps API key missing</p>
        <p className="mt-2 text-amber-800">
          Add <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
          <code className="rounded bg-amber-100 px-1">meditrack-frontend/.env</code> and enable{' '}
          <strong>Maps JavaScript API</strong> and <strong>Directions API</strong> for your Google Cloud project.
        </p>
      </div>
    );
  }
  return <GoogleShopsMapInner shops={shops} apiKey={apiKey} />;
}
