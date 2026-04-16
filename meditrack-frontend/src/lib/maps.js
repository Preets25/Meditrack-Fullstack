/**
 * Map helpers: Google Maps URLs work without an API key for opening / basic embeds.
 * Interactive directory map uses Leaflet + OpenStreetMap (see ShopsMap.jsx).
 */

export function hasCoords(shop) {
  const lat = shop?.latitude;
  const lng = shop?.longitude;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  );
}

/** Opens Google Maps at the shop (coordinates preferred). */
export function googleMapsOpenUrl(shop) {
  if (hasCoords(shop)) {
    return `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`;
  }
  const q = shop?.address || shop?.name || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** iframe src for embedded Google map (no API key). */
export function googleMapsEmbedUrl(shop) {
  if (hasCoords(shop)) {
    return `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}&z=16&output=embed`;
  }
  const q = encodeURIComponent(shop?.address || shop?.name || '');
  return `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
